-- UNSEEN store settings and server-enforced shipping calculation.
-- Run after coupons-system.sql in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.store_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  shipping_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  free_shipping_threshold numeric(12,2) CHECK (free_shipping_threshold IS NULL OR free_shipping_threshold >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.store_settings (id, shipping_fee, free_shipping_threshold)
VALUES (true, 0, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.store_settings TO authenticated;

DROP POLICY IF EXISTS "Public can read store settings" ON public.store_settings;
CREATE POLICY "Public can read store settings"
ON public.store_settings FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage store settings" ON public.store_settings;
CREATE POLICY "Admins can manage store settings"
ON public.store_settings FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users AS admin WHERE admin.user_id = (SELECT auth.uid()))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users AS admin WHERE admin.user_id = (SELECT auth.uid()))
);

CREATE OR REPLACE FUNCTION public.apply_store_shipping_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_shipping_fee numeric := 0;
  v_free_threshold numeric := NULL;
  v_discounted_subtotal numeric := 0;
BEGIN
  SELECT shipping_fee, free_shipping_threshold
  INTO v_shipping_fee, v_free_threshold
  FROM public.store_settings
  WHERE id = true;

  v_discounted_subtotal := greatest(0, coalesce(NEW.subtotal, 0) - coalesce(NEW.discount_amount, 0));

  IF v_free_threshold IS NOT NULL AND v_discounted_subtotal >= v_free_threshold THEN
    NEW.shipping_fee := 0;
  ELSE
    NEW.shipping_fee := coalesce(v_shipping_fee, 0);
  END IF;

  NEW.total := v_discounted_subtotal + NEW.shipping_fee;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS apply_store_shipping_fee_before_insert ON public.orders;
CREATE TRIGGER apply_store_shipping_fee_before_insert
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.apply_store_shipping_fee();
