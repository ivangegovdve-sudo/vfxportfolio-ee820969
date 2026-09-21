-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid());

-- First signed-up user becomes admin; everyone else gets a profile only
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CV versions (private drafts, admin only)
CREATE TABLE public.cv_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  purpose text,
  data jsonb NOT NULL,
  is_live boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cv_versions TO authenticated;
GRANT ALL ON public.cv_versions TO service_role;
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage cv versions"
ON public.cv_versions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Published snapshots (public read)
CREATE TABLE public.cv_published (
  version_id uuid PRIMARY KEY REFERENCES public.cv_versions(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  data jsonb NOT NULL,
  is_live boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cv_published TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cv_published TO authenticated;
GRANT ALL ON public.cv_published TO service_role;
ALTER TABLE public.cv_published ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published cv"
ON public.cv_published FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage published cv"
ON public.cv_published FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only one live version at a time
CREATE OR REPLACE FUNCTION public.enforce_single_live_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_live THEN
    UPDATE public.cv_versions SET is_live = false WHERE id <> NEW.id AND is_live;
    UPDATE public.cv_published SET is_live = false WHERE version_id <> NEW.id AND is_live;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cv_versions_single_live
AFTER INSERT OR UPDATE OF is_live ON public.cv_versions
FOR EACH ROW WHEN (NEW.is_live) EXECUTE FUNCTION public.enforce_single_live_version();

CREATE OR REPLACE FUNCTION public.touch_cv_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER cv_versions_touch
BEFORE UPDATE ON public.cv_versions
FOR EACH ROW EXECUTE FUNCTION public.touch_cv_version();