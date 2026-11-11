-- ==============================================================================
-- INNBITE MIGRATION 007: Waiter Push Subscriptions for Background & Lock-Screen Alerts
-- ==============================================================================
-- Allows waiter devices (Android, iOS PWA, PC) to receive native lock-screen
-- push notifications via Web Push API when orders are placed, even if the browser
-- is closed or the device screen is locked.
-- ==============================================================================

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

-- Index on endpoint for quick lookup and upsert
CREATE INDEX IF NOT EXISTS idx_waiter_push_subscriptions_endpoint ON waiter_push_subscriptions(endpoint);

-- Disable Row Level Security so anon key and API can insert and query subscriptions
ALTER TABLE waiter_push_subscriptions DISABLE ROW LEVEL SECURITY;
