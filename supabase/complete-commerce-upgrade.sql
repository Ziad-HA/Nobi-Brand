-- UNSEEN COMPLETE COMMERCE UPGRADE
-- Run this single file once in Supabase SQL Editor.
-- Includes coupon validation + checkout, customer order history, shipping rules,
-- admin analytics, and realtime order events.
-- Keep the order of sections unchanged.

-- ============================================================
-- SECTION 1: supabase/coupons-system.sql
-- ============================================================

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

-- ============================================================
-- SECTION 2: supabase/customer-accounts.sql
-- ============================================================

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

-- ============================================================
-- SECTION 3: supabase/store-settings.sql
-- ============================================================

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

-- ============================================================
-- SECTION 4: supabase/admin-analytics.sql
-- ============================================================

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

-- ============================================================
-- SECTION 5: supabase/realtime-notifications.sql
-- ============================================================

-- Enable live order events for the private admin dashboard.
-- Run once in Supabase SQL Editor. The dashboard still supports manual refresh.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'orders'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END
$$;

-- ============================================================
-- SECTION 6: admin order update permission
-- ============================================================

-- Allow authenticated administrators to update order fulfillment status.
-- This policy is scoped to users listed in public.admin_users.
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users AS admin
    WHERE admin.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users AS admin
    WHERE admin.user_id = (SELECT auth.uid())
  )
);
