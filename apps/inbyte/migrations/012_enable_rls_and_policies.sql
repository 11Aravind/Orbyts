-- ==============================================================================
-- 012: Enable RLS (Row Level Security) and Secure Access Policies
-- ==============================================================================

-- 1. Ensure waiter_push_subscriptions table exists in case migration 007 was skipped
CREATE TABLE IF NOT EXISTS waiter_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waiter_id VARCHAR,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waiter_push_subscriptions_endpoint ON waiter_push_subscriptions(endpoint);

-- 2. Enable Row Level Security on all application tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiter_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Idempotent Policy Definitions (Allows client-side operations via anon API)
-- Dishes
DROP POLICY IF EXISTS "Allow all for dishes" ON dishes;
CREATE POLICY "Allow all for dishes" ON dishes FOR ALL USING (true) WITH CHECK (true);

-- Categories
DROP POLICY IF EXISTS "Allow all for categories" ON categories;
CREATE POLICY "Allow all for categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Banners
DROP POLICY IF EXISTS "Allow all for banners" ON banners;
CREATE POLICY "Allow all for banners" ON banners FOR ALL USING (true) WITH CHECK (true);

-- Tables
DROP POLICY IF EXISTS "Allow all for tables" ON tables;
CREATE POLICY "Allow all for tables" ON tables FOR ALL USING (true) WITH CHECK (true);

-- Restaurant Settings
DROP POLICY IF EXISTS "Allow all for restaurant_settings" ON restaurant_settings;
CREATE POLICY "Allow all for restaurant_settings" ON restaurant_settings FOR ALL USING (true) WITH CHECK (true);

-- Orders
DROP POLICY IF EXISTS "Allow all for orders" ON orders;
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "Allow all for order_items" ON order_items;
CREATE POLICY "Allow all for order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Waiter Push Subscriptions
DROP POLICY IF EXISTS "Allow all for waiter_push_subscriptions" ON waiter_push_subscriptions;
CREATE POLICY "Allow all for waiter_push_subscriptions" ON waiter_push_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Admins & Staff Accounts
DROP POLICY IF EXISTS "Allow all for admins" ON admins;
CREATE POLICY "Allow all for admins" ON admins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for waiters" ON waiters;
CREATE POLICY "Allow all for waiters" ON waiters FOR ALL USING (true) WITH CHECK (true);
