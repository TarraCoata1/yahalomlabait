
-- ========== Move SECURITY DEFINER functions out of exposed API schema ==========
CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;

-- Drop policies depending on public.has_role so we can drop & recreate the function
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "public read active categories" ON public.categories;
DROP POLICY IF EXISTS "admins manage categories" ON public.categories;
DROP POLICY IF EXISTS "public read visible products" ON public.products;
DROP POLICY IF EXISTS "admins manage products" ON public.products;

-- Drop triggers that reference public functions we'll move
DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_admin ON auth.users;
DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.bootstrap_admin_on_signup();
DROP FUNCTION IF EXISTS public.touch_updated_at();

-- Recreate in app_private
CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, app_private
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION app_private.bootstrap_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, app_private
AS $$
BEGIN
  IF NEW.email = 'lielwa2004@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.bootstrap_admin_on_signup() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Recreate triggers
CREATE TRIGGER on_auth_user_created_bootstrap_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION app_private.bootstrap_admin_on_signup();

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();

-- Recreate policies using app_private.has_role
CREATE POLICY "admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "public read active categories"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (is_active OR app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage categories"
  ON public.categories FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "public read visible products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (NOT is_hidden OR app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage products"
  ON public.products FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

-- ========== Storage policies for 'products' bucket ==========
DROP POLICY IF EXISTS "products read" ON storage.objects;
DROP POLICY IF EXISTS "products admin insert" ON storage.objects;
DROP POLICY IF EXISTS "products admin update" ON storage.objects;
DROP POLICY IF EXISTS "products admin delete" ON storage.objects;

CREATE POLICY "products read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'products');

CREATE POLICY "products admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "products admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'products' AND app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'products' AND app_private.has_role(auth.uid(), 'admin'));

CREATE POLICY "products admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND app_private.has_role(auth.uid(), 'admin'));
