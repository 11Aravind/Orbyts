-- ==============================================================================
-- 013: Enforce Shop Open/Closed Status, Order Columns, and Idempotency
-- ==============================================================================

-- 1. Ensure restaurant_settings has is_closed boolean
ALTER TABLE restaurant_settings
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false;

-- 2. Ensure orders has idempotency_key and POS/financial columns safely
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR,
ADD COLUMN IF NOT EXISTS is_pos BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS discount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS waiter_name VARCHAR;

-- 3. Unique index on non-null idempotency_key to prevent duplicate orders on retry/double-submit
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
ON orders(idempotency_key)
WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id
ON orders(razorpay_payment_id)
WHERE razorpay_payment_id IS NOT NULL;

-- 4. Database-level trigger preventing customer orders when restaurant is closed
CREATE OR REPLACE FUNCTION enforce_shop_open_before_order_insert()
RETURNS TRIGGER AS $$
DECLARE
    shop_is_closed BOOLEAN;
BEGIN
    -- Staff/Admin POS orders are allowed even when customer ordering is closed
    IF COALESCE(NEW.is_pos, false) = true THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(is_closed, false)
    INTO shop_is_closed
    FROM restaurant_settings
    WHERE restaurant_id = COALESCE(NEW.restaurant_id, 'R001')
    LIMIT 1;

    IF COALESCE(shop_is_closed, false) = true THEN
        RAISE EXCEPTION 'SHOP_CLOSED: Restaurant is currently closed and not accepting online orders.'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_shop_open_before_order_insert ON orders;
CREATE TRIGGER trg_enforce_shop_open_before_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION enforce_shop_open_before_order_insert();

-- 5. Ensure restaurant_settings is published to supabase_realtime for instant postgres_changes sync
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND tablename = 'restaurant_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_settings;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

