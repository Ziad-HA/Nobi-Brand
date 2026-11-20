-- UNSEEN admin analytics: all-time totals and recent monthly performance.
-- Run once in Supabase SQL Editor.

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
        WHERE created_at >= date_trunc('month', now()) - interval '5 months'
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
