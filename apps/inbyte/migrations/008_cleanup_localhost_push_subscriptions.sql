-- ==============================================================================
-- INNBITE MIGRATION 008: Clean up legacy localhost push subscriptions
-- ==============================================================================
-- Removes any localhost subscriptions from the cloud store in waiters table
-- to ensure only production devices (waiter phones and live dashboards) receive alerts.
-- ==============================================================================

UPDATE waiters
SET google_email = (
    SELECT json_agg(elem)::text
    FROM json_array_elements(google_email::json) AS elem
    WHERE (elem->>'endpoint') NOT LIKE '%fbD-EgCxu7A%'
)
WHERE id = 'push_subscriptions_store'
  AND google_email IS NOT NULL
  AND google_email LIKE '%fbD-EgCxu7A%';
