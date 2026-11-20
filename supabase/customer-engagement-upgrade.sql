-- UNSEEN CUSTOMER ENGAGEMENT UPGRADE
-- Run once in Supabase SQL Editor after complete-commerce-upgrade.sql.
-- Adds saved carts, abandoned-cart reporting, verified product reviews,
-- customer order-status notifications, and expanded admin analytics.

BEGIN;

-- 1) Persistent carts for signed-in customers
CREATE TABLE IF NOT EXISTS public.saved_carts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(items) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_carts TO authenticated;
DROP POLICY IF EXISTS "Customers manage their saved cart" ON public.saved_carts;
CREATE POLICY "Customers manage their saved cart"
ON public.saved_carts FOR ALL TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Admins can read saved carts" ON public.saved_carts;
CREATE POLICY "Admins can read saved carts"
ON public.saved_carts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = (SELECT auth.uid())));

-- 2) Product reviews: one review per customer/product, after a delivered purchase
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 90),
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 8 AND 1200),
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
-- Ensure columns exist when a partial/older reviews table was created previously.
ALTER TABLE public.product_reviews
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS product_reviews_product_created_idx
  ON public.product_reviews(product_id, created_at DESC);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.product_reviews TO authenticated;
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.product_reviews;
CREATE POLICY "Public can read approved reviews"
ON public.product_reviews FOR SELECT TO anon, authenticated
USING (
  is_approved = true
  OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = (SELECT auth.uid()))
);
DROP POLICY IF EXISTS "Verified customers can write reviews" ON public.product_reviews;
CREATE POLICY "Verified customers can write reviews"
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
DROP POLICY IF EXISTS "Admins can moderate reviews" ON public.product_reviews;
CREATE POLICY "Admins can moderate reviews"
ON public.product_reviews FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = (SELECT auth.uid())));

-- 3) Customer notifications whenever an order's fulfillment status changes
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_notifications_user_created_idx
  ON public.order_notifications(user_id, created_at DESC);
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
  IF NEW.user_id IS NOT NULL AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_notifications (
      user_id, order_id, old_status, new_status, message
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      OLD.status,
      NEW.status,
      'Your UNSEEN order status is now ' || replace(NEW.status, '_', ' ') || '.'
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_customer_order_status_after_update ON public.orders;
CREATE TRIGGER notify_customer_order_status_after_update
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_customer_order_status();

-- Enable realtime for customer notifications
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

-- 4) Admin-only abandoned-cart report (24+ hours without an update)
CREATE OR REPLACE FUNCTION public.admin_abandoned_carts()
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

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'user_id', sc.user_id,
    'email', au.email,
    'items', sc.items,
    'updated_at', sc.updated_at
  ) ORDER BY sc.updated_at ASC), '[]'::jsonb)
  INTO v_result
  FROM public.saved_carts sc
  LEFT JOIN auth.users au ON au.id = sc.user_id
  WHERE jsonb_array_length(sc.items) > 0
    AND sc.updated_at < now() - interval '24 hours';

  RETURN v_result;
END;
$function$;
GRANT EXECUTE ON FUNCTION public.admin_abandoned_carts() TO authenticated;

-- 5) Expanded analytics for the admin dashboard
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
      SELECT coalesce(round(avg(total), 2), 0)
      FROM public.orders WHERE status <> 'cancelled'
    ),
    'cancelled_orders', (SELECT count(*) FROM public.orders WHERE status = 'cancelled'),
    'cancellation_rate', (
      SELECT coalesce(round(100.0 * count(*) FILTER (WHERE status = 'cancelled') / nullif(count(*), 0), 1), 0)
      FROM public.orders
    ),
    'saved_carts', (
      SELECT count(*) FROM public.saved_carts WHERE jsonb_array_length(items) > 0
    ),
    'low_stock', (
      SELECT count(*) FROM public.products
      WHERE stock_quantity IS NOT NULL
        AND stock_quantity > 0
        AND stock_quantity <= coalesce(low_stock_threshold, 5)
    ),
    'out_of_stock', (
      SELECT count(*) FROM public.products WHERE stock_quantity IS NOT NULL AND stock_quantity = 0
    ),
    'inventory_tracked', (
      SELECT count(*) FROM public.products WHERE stock_quantity IS NOT NULL
    ),
    'monthly', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'month', to_char(month_start, 'Mon YY'),
        'orders', order_count,
        'revenue', paid_revenue
      ) ORDER BY month_start)
      FROM (
        SELECT date_trunc('month', month_value) AS month_start,
          (SELECT count(*) FROM public.orders o
           WHERE date_trunc('month', o.created_at) = date_trunc('month', month_value)) AS order_count,
          (SELECT coalesce(sum(o.total), 0) FROM public.orders o
           WHERE date_trunc('month', o.created_at) = date_trunc('month', month_value)
             AND o.payment_status = 'paid') AS paid_revenue
        FROM generate_series(
          date_trunc('month', now()) - interval '11 months',
          date_trunc('month', now()),
          interval '1 month'
        ) AS months(month_value)
      ) monthly_rows
    ), '[]'::jsonb),
    'top_products', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'name', product_name, 'units', units_sold, 'sales_value', sales_value
      ) ORDER BY units_sold DESC)
      FROM (
        SELECT product_name,
          sum(quantity)::integer AS units_sold,
          coalesce(sum(unit_price * quantity), 0) AS sales_value
        FROM public.order_items
        GROUP BY product_name
        ORDER BY sum(quantity) DESC
        LIMIT 5
      ) best_sellers
    ), '[]'::jsonb),
    'order_statuses', coalesce((
      SELECT jsonb_agg(jsonb_build_object('status', status, 'count', status_count) ORDER BY status)
      FROM (
        SELECT status, count(*) AS status_count
        FROM public.orders
        GROUP BY status
      ) status_totals
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$function$;
GRANT EXECUTE ON FUNCTION public.admin_store_analytics() TO authenticated;

COMMIT;
