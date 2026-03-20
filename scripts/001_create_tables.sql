-- Ensure extension used by UUID defaults exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin users table for dashboard authentication/authorization
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Managed users/customers table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  items JSONB,
  shipping_address TEXT,
  payment_method TEXT CHECK (payment_method IN ('card', 'paypal', 'bank_transfer', 'cash')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Reset + recreate idempotent policies
DROP POLICY IF EXISTS "auth can select admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "auth can insert admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "auth can update admin_users" ON public.admin_users;
CREATE POLICY "auth can select admin_users" ON public.admin_users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth can insert admin_users" ON public.admin_users
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth can update admin_users" ON public.admin_users
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth can select users" ON public.users;
DROP POLICY IF EXISTS "auth can insert users" ON public.users;
DROP POLICY IF EXISTS "auth can update users" ON public.users;
DROP POLICY IF EXISTS "auth can delete users" ON public.users;
CREATE POLICY "auth can select users" ON public.users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth can insert users" ON public.users
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth can update users" ON public.users
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth can delete users" ON public.users
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth can select orders" ON public.orders;
DROP POLICY IF EXISTS "auth can insert orders" ON public.orders;
DROP POLICY IF EXISTS "auth can update orders" ON public.orders;
DROP POLICY IF EXISTS "auth can delete orders" ON public.orders;
CREATE POLICY "auth can select orders" ON public.orders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth can insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
