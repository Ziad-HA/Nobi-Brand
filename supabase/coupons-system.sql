-- UNSEEN commerce upgrade: coupons
-- Run this file once in Supabase SQL Editor after reviewing it.
-- Coupon discounts are calculated and enforced inside the database transaction.

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric(12,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
  max_discount_amount numeric(12,2) CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_count integer NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT coupons_percent_max CHECK (discount_type <> 'percent' OR discount_value <= 100),
  CONSTRAINT coupons_date_order CHECK (expires_at IS NULL OR starts_at IS NULL OR expires_at > starts_at)
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_discount_amount_nonnegative;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_discount_amount_nonnegative CHECK (discount_amount >= 0);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users AS admin WHERE admin.user_id = (SELECT auth.uid()))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users AS admin WHERE admin.user_id = (SELECT auth.uid()))
);

-- Preview is informational only. place_order rechecks every rule under a row lock.
CREATE OR REPLACE FUNCTION public.preview_coupon(p_code text, p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_item jsonb;
  v_product_price numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_code text := upper(trim(coalesce(p_code, '')));
BEGIN
  IF v_code = '' THEN RAISE EXCEPTION 'Enter a coupon code.'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF coalesce(v_item->>'product_id', '') = '' OR coalesce((v_item->>'quantity')::integer, 0) < 1 THEN
      RAISE EXCEPTION 'Invalid cart item.';
    END IF;
    SELECT price INTO v_product_price
    FROM public.products
    WHERE id = v_item->>'product_id' AND is_active = true AND sold_out = false;
    IF NOT FOUND THEN RAISE EXCEPTION 'A product in your cart is unavailable.'; END IF;
    v_subtotal := v_subtotal + v_product_price * (v_item->>'quantity')::integer;
  END LOOP;

  SELECT * INTO v_coupon FROM public.coupons WHERE code = v_code AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'This coupon code is invalid or inactive.'; END IF;
  IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN
    RAISE EXCEPTION 'This coupon is not active yet.';
  END IF;
  IF v_coupon.expires_at IS NOT NULL AND now() >= v_coupon.expires_at THEN
    RAISE EXCEPTION 'This coupon has expired.';
  END IF;
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RAISE EXCEPTION 'This coupon has reached its usage limit.';
  END IF;
  IF v_subtotal < v_coupon.min_order_amount THEN
    RAISE EXCEPTION 'Your order does not meet the minimum amount for this coupon.';
  END IF;

  IF v_coupon.discount_type = 'percent' THEN
    v_discount := v_subtotal * v_coupon.discount_value / 100;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;
  IF v_coupon.max_discount_amount IS NOT NULL THEN
    v_discount := least(v_discount, v_coupon.max_discount_amount);
  END IF;
  v_discount := least(v_subtotal, round(v_discount, 2));

  RETURN jsonb_build_object(
    'code', v_code,
    'subtotal', v_subtotal,
    'discount_amount', v_discount,
    'total', v_subtotal - v_discount
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.preview_coupon(text, jsonb) TO anon, authenticated;

-- Replace the existing 8-argument function with a 9-argument version.
DROP FUNCTION IF EXISTS public.place_order(text, text, text, text, text, text, text, jsonb);

CREATE FUNCTION public.place_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_note text,
  p_items jsonb,
  p_coupon_code text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id uuid := gen_random_uuid();
  v_item jsonb;
  v_product record;
  v_product_id text;
  v_locked_product_id text;
  v_quantity integer;
  v_color text;
  v_size text;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_coupon_code text := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
  v_coupon public.coupons%ROWTYPE;
BEGIN
  IF NULLIF(trim(p_customer_name), '') IS NULL
     OR NULLIF(trim(p_customer_email), '') IS NULL
     OR NULLIF(trim(p_customer_phone), '') IS NULL
     OR NULLIF(trim(p_address), '') IS NULL
     OR NULLIF(trim(p_city), '') IS NULL THEN
    RAISE EXCEPTION 'Please complete all required customer details.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  FOR v_locked_product_id IN
    SELECT DISTINCT value->>'product_id'
    FROM jsonb_array_elements(p_items)
    ORDER BY value->>'product_id'
  LOOP
    PERFORM 1 FROM public.products
    WHERE id = v_locked_product_id AND is_active = true
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'A product in your cart is unavailable.'; END IF;
  END LOOP;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;
    v_color := v_item->>'selected_color';
    v_size := v_item->>'selected_size';

    IF v_product_id IS NULL OR v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 20 THEN
      RAISE EXCEPTION 'Invalid product or quantity.';
    END IF;

    SELECT id, name, price, colors, sizes, sold_out, stock_quantity
    INTO v_product FROM public.products
    WHERE id = v_product_id AND is_active = true;

    IF NOT FOUND OR v_product.sold_out THEN RAISE EXCEPTION 'A product in your cart is unavailable.'; END IF;
    IF cardinality(v_product.colors) > 0 AND (v_color IS NULL OR NOT (v_color = ANY(v_product.colors))) THEN
      RAISE EXCEPTION 'Invalid color selected for %.', v_product.name;
    END IF;
    IF cardinality(v_product.sizes) > 0 AND (v_size IS NULL OR NOT (v_size = ANY(v_product.sizes))) THEN
      RAISE EXCEPTION 'Invalid size selected for %.', v_product.name;
    END IF;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  END LOOP;

  -- Lock and revalidate the coupon during checkout so concurrent orders cannot exceed its limit.
  IF v_coupon_code IS NOT NULL THEN
    SELECT * INTO v_coupon FROM public.coupons
    WHERE code = v_coupon_code AND is_active = true
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'This coupon code is invalid or inactive.'; END IF;
    IF v_coupon.starts_at IS NOT NULL AND now() < v_coupon.starts_at THEN RAISE EXCEPTION 'This coupon is not active yet.'; END IF;
    IF v_coupon.expires_at IS NOT NULL AND now() >= v_coupon.expires_at THEN RAISE EXCEPTION 'This coupon has expired.'; END IF;
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN RAISE EXCEPTION 'This coupon has reached its usage limit.'; END IF;
    IF v_subtotal < v_coupon.min_order_amount THEN RAISE EXCEPTION 'Your order does not meet the minimum amount for this coupon.'; END IF;

    IF v_coupon.discount_type = 'percent' THEN
      v_discount := v_subtotal * v_coupon.discount_value / 100;
    ELSE
      v_discount := v_coupon.discount_value;
    END IF;
    IF v_coupon.max_discount_amount IS NOT NULL THEN
      v_discount := least(v_discount, v_coupon.max_discount_amount);
    END IF;
    v_discount := least(v_subtotal, round(v_discount, 2));

    UPDATE public.coupons
    SET usage_count = usage_count + 1, updated_at = now()
    WHERE id = v_coupon.id;
  END IF;

  INSERT INTO public.orders (
    id, customer_name, customer_email, customer_phone,
    address, city, postal_code, delivery_note,
    subtotal, shipping_fee, total, currency, status,
    payment_method, payment_status, coupon_code, discount_amount,
    created_at, updated_at
  )
  VALUES (
    v_order_id, trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    trim(p_address), trim(p_city), nullif(trim(p_postal_code), ''), nullif(trim(p_delivery_note), ''),
    v_subtotal, 0, v_subtotal - v_discount, 'EGP', 'pending',
    'cash_on_delivery', 'unpaid', v_coupon_code, v_discount, now(), now()
  );

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;
    v_color := v_item->>'selected_color';
    v_size := v_item->>'selected_size';

    SELECT id, name, price, stock_quantity INTO v_product
    FROM public.products WHERE id = v_product_id;

    IF v_product.stock_quantity IS NOT NULL THEN
      IF v_product.stock_quantity < v_quantity THEN
        RAISE EXCEPTION 'Not enough stock for %. Available: %, requested: %.',
          v_product.name, v_product.stock_quantity, v_quantity;
      END IF;
      UPDATE public.products
      SET stock_quantity = stock_quantity - v_quantity,
          sold_out = (stock_quantity - v_quantity = 0),
          updated_at = now()
      WHERE id = v_product_id;
    END IF;

    INSERT INTO public.order_items (
      id, order_id, product_id, product_name, unit_price,
      quantity, selected_color, selected_size, created_at
    )
    VALUES (
      gen_random_uuid(), v_order_id, v_product.id, v_product.name, v_product.price,
      v_quantity, v_color, v_size, now()
    );
  END LOOP;

  RETURN v_order_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, text, text, text, jsonb, text) TO anon, authenticated;
