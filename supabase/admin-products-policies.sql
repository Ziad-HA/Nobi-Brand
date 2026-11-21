-- UNSEEN admin catalog permissions
-- Run once in Supabase SQL Editor after confirming your admin_users row exists.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

DROP POLICY IF EXISTS "Admins can read all products" ON public.products;
CREATE POLICY "Admins can read all products"
ON public.products FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE public.admin_users.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE public.admin_users.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE public.admin_users.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE public.admin_users.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE public.admin_users.user_id = (SELECT auth.uid())
  )
);
