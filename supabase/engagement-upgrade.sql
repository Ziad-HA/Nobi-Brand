-- UNSEEN engagement upgrade
-- Run once in Supabase SQL Editor after the existing commerce migrations.

-- 1) Persistent carts for signed-in customers.
CREATE TABLE IF NOT EXISTS public.saved_carts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(items) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_carts TO authenticated;
DROP POLICY IF EXISTS "Customers manage own saved cart" ON public.saved_carts;
CREATE POLICY "Customers manage own saved cart"
ON public.saved_carts FOR ALL TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- 2) Verified-buyer product reviews. Only customers with a delivered order
-- containing the product may publish a review.
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 90),
  body text NOT NULL CHECK (length(trim(body)) BETWEEN 8 AND 1200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS product_reviews_product_created_idx
  ON public.product_reviews (product_id, created_at DESC);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
DROP POLICY IF EXISTS "Anyone can read product reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read product reviews"
ON public.product_reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Verified customers can add product reviews" ON public.product_reviews;
CREATE POLICY "Verified customers can add product reviews"
ON public.product_reviews FOR INSERT TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.user_id = (SELECT auth.uid())
      AND o.status = 'delivered'
      AND oi.product_id = product_reviews.product_id
  )
);
DROP POLICY IF EXISTS "Customers can edit own product reviews" ON public.product_reviews;
CREATE POLICY "Customers can edit own product reviews"
ON public.product_reviews FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Customers and admins can delete reviews" ON public.product_reviews;
CREATE POLICY "Customers and admins can delete reviews"
ON public.product_reviews FOR DELETE TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = (SELECT auth.uid()))
);

-- 3) Durable order-status notifications for customers.
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_notifications_user_created_idx
  ON public.order_notifications (user_id, created_at DESC);
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.order_notifications TO authenticated;
DROP POLICY IF EXISTS "Customers read own order notifications" ON public.order_notifications;
CREATE POLICY "Customers read own order notifications"
ON public.order_notifications FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Customers update own order notifications" ON public.order_notifications;
CREATE POLICY "Customers update own order notifications"
ON public.order_notifications FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.notify_customer_order_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.order_notifications (
      order_id, user_id, old_status, new_status, message
    ) VALUES (
      NEW.id,
      NEW.user_id,
      OLD.status,
      NEW.status,
      'Your order status changed to ' || replace(NEW.status, '_', ' ') || '.'
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_customer_order_status_after_update ON public.orders;
CREATE TRIGGER notify_customer_order_status_after_update
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_customer_order_status();

-- Add customer notifications to Supabase Realtime when publication exists.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'order_notifications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_notifications;
  END IF;
END
$$;

-- 4) Expanded admin analytics: order mix, AOV, cancellation rate,
-- monthly performance, top sellers, inventory health and saved carts.
CREATE OR REPLACE FUNCTION public.admin_store_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not authorized.';
  END IF;

  SELECT jsonb_build_object(
    'total_orders', (SELECT count(*) FROM public.orders),
    'pending_orders', (SELECT count(*) FROM public.orders WHERE status = 'pending'),
    'paid_orders', (SELECT count(*) FROM public.orders WHERE payment_status = 'paid'),
    'paid_revenue', (SELECT coalesce(sum(total), 0) FROM public.orders WHERE payment_status = 'paid'),
    'order_value', (SELECT coalesce(sum(total), 0) FROM public.orders WHERE status <> 'cancelled'),
    'average_order_value', (
      SELECT coalesce(round(avg(total), 2), 0) FROM public.orders WHERE status <> 'cancelled'
    ),
    'cancelled_orders', (SELECT count(*) FROM public.orders WHERE status = 'cancelled'),
    'cancellation_rate', (
      SELECT coalesce(round(100.0 * count(*) FILTER (WHERE status = 'cancelled') / nullif(count(*), 0), 1), 0)
      FROM public.orders
    ),
    'saved_carts', (SELECT count(*) FROM public.saved_carts WHERE jsonb_array_length(items) > 0),
    'inventory_tracked', (SELECT count(*) FROM public.products WHERE stock_quantity IS NOT NULL),
    'low_stock', (
      SELECT count(*) FROM public.products
      WHERE stock_quantity IS NOT NULL
        AND stock_quantity > 0
        AND stock_quantity <= coalesce(low_stock_threshold, 5)
    ),
    'out_of_stock', (
      SELECT count(*) FROM public.products
      WHERE stock_quantity IS NOT NULL AND stock_quantity = 0
    ),
    'order_statuses', coalesce((
      SELECT jsonb_agg(jsonb_build_object('status', status, 'count', status_count) ORDER BY status)
      FROM (
        SELECT status, count(*) AS status_count
        FROM public.orders GROUP BY status
      ) status_totals
    ), '[]'::jsonb),
    'monthly', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'month', to_char(month_start, 'Mon YY'),
        'orders', order_count,
        'revenue', paid_revenue
      ) ORDER BY month_start)
      FROM (
        SELECT date_trunc('month', created_at) AS month_start,
               count(*) AS order_count,
               coalesce(sum(total) FILTER (WHERE payment_status = 'paid'), 0) AS paid_revenue
        FROM public.orders
        WHERE created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY 1
      ) AS monthly_totals
    ), '[]'::jsonb),
    'top_products', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'name', product_name,
        'units', units_sold,
        'sales_value', sales_value
      ) ORDER BY units_sold DESC)
      FROM (
        SELECT product_name,
               sum(quantity)::integer AS units_sold,
               coalesce(sum(unit_price * quantity), 0) AS sales_value
        FROM public.order_items
        GROUP BY product_name
        ORDER BY sum(quantity) DESC
        LIMIT 5
      ) AS best_sellers
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$function$;
GRANT EXECUTE ON FUNCTION public.admin_store_analytics() TO authenticated;
