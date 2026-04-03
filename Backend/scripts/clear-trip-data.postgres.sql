-- Clear all trip requests and related rows (Postgres).
-- Run while the API is stopped, as your DB user, e.g.:
--   psql -h localhost -U postgres -d fleet_management -f scripts/clear-trip-data.postgres.sql
--
-- If column names differ (naming strategy), adjust quoted identifiers.

BEGIN;

UPDATE fuel_records SET "tripId" = NULL WHERE "tripId" IS NOT NULL;

DELETE FROM gps_locations;
DELETE FROM trip_feedback;
DELETE FROM approvals;
DELETE FROM trip_requests;

COMMIT;
