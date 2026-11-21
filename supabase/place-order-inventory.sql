-- UNSEEN: transactional inventory deduction for checkout
-- Run this file once in Supabase SQL Editor.
-- Products with stock_quantity IS NULL remain untracked until real stock is entered.

CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_note text,
  p_items jsonb
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
BEGIN
  IF NULLIF(trim(p_customer_name), '') IS NULL
     OR NULLIF(trim(p_customer_email), '') IS NULL
     OR NULLIF(trim(p_customer_phone), '') IS NULL
     OR NULLIF(trim(p_address), '') IS NULL
     OR NULLIF(trim(p_city), '') IS NULL THEN
    RAISE EXCEPTION 'Please complete all required customer details.';
  END IF;

  IF p_items IS NULL
     OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  -- Lock every distinct product in a stable order to prevent overselling
  -- when multiple customers check out at the same time.
  FOR v_locked_product_id IN
    SELECT DISTINCT value->>'product_id'
    FROM jsonb_array_elements(p_items)
    ORDER BY value->>'product_id'
  LOOP
    PERFORM 1
    FROM public.products
    WHERE id = v_locked_product_id
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is unavailable.';
    END IF;
  END LOOP;

  -- Validate each cart line and calculate the authoritative subtotal.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;
    v_color := v_item->>'selected_color';
    v_size := v_item->>'selected_size';

    IF v_product_id IS NULL OR v_quantity IS NULL
       OR v_quantity < 1 OR v_quantity > 20 THEN
      RAISE EXCEPTION 'Invalid product or quantity.';
    END IF;

    SELECT id, name, price, colors, sizes, sold_out, stock_quantity
    INTO v_product
    FROM public.products
    WHERE id = v_product_id
      AND is_active = true;

    IF NOT FOUND OR v_product.sold_out THEN
      RAISE EXCEPTION 'A product in your cart is unavailable.';
    END IF;

    IF cardinality(v_product.colors) > 0
       AND (v_color IS NULL OR NOT (v_color = ANY(v_product.colors))) THEN
      RAISE EXCEPTION 'Invalid color selected for %.', v_product.name;
    END IF;

    IF cardinality(v_product.sizes) > 0
       AND (v_size IS NULL OR NOT (v_size = ANY(v_product.sizes))) THEN
      RAISE EXCEPTION 'Invalid size selected for %.', v_product.name;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  END LOOP;

  INSERT INTO public.orders (
    id, customer_name, customer_email, customer_phone,
    address, city, postal_code, delivery_note,
    subtotal, shipping_fee, total, currency,
    status, payment_method, payment_status,
    created_at, updated_at
  )
  VALUES (
    v_order_id,
    trim(p_customer_name),
    trim(p_customer_email),
    trim(p_customer_phone),
    trim(p_address),
    trim(p_city),
    NULLIF(trim(p_postal_code), ''),
    NULLIF(trim(p_delivery_note), ''),
    v_subtotal,
    0,
    v_subtotal,
    'EGP',
    'pending',
    'cash_on_delivery',
    'unpaid',
    now(),
    now()
  );

  -- Insert order lines and decrement tracked stock. If any line cannot be
  -- fulfilled, raising an exception rolls back the order and every deduction.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_quantity := (v_item->>'quantity')::integer;
    v_color := v_item->>'selected_color';
    v_size := v_item->>'selected_size';

    SELECT id, name, price, stock_quantity
    INTO v_product
    FROM public.products
    WHERE id = v_product_id;

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
      id, order_id, product_id, product_name,
      unit_price, quantity, selected_color,
      selected_size, created_at
    )
    VALUES (
      gen_random_uuid(),
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.price,
      v_quantity,
      v_color,
      v_size,
      now()
    );
  END LOOP;

  RETURN v_order_id;
END;
$function$;


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
