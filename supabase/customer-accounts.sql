-- UNSEEN customer accounts: link authenticated checkouts to their owner.
-- Run after coupons-system.sql in Supabase SQL Editor.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx
  ON public.orders (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.attach_order_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS attach_order_customer_before_insert ON public.orders;
CREATE TRIGGER attach_order_customer_before_insert
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.attach_order_customer();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.orders, public.order_items TO authenticated;

DROP POLICY IF EXISTS "Customers can read own orders" ON public.orders;
CREATE POLICY "Customers can read own orders"
ON public.orders FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Customers can read own order items" ON public.order_items;
CREATE POLICY "Customers can read own order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders AS customer_order
    WHERE customer_order.id = order_items.order_id
      AND customer_order.user_id = (SELECT auth.uid())
  )
);
