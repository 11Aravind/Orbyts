-- ==============================================================================
-- 011: Atomic Order Number Sequence
-- ==============================================================================
-- Ensures concurrent orders generate unique sequential order numbers atomically
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1045;
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('order_number_seq')::text;

