-- Wipe all data except user accounts (Postgres). Stop the API first.
-- Example: psql "$DATABASE_URL" -f scripts/clear-all-but-users.postgres.sql
--
-- Adjust quoted identifiers if your TypeORM naming differs.

BEGIN;

UPDATE fuel_records SET "tripId" = NULL WHERE "tripId" IS NOT NULL;

DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM gps_locations;
DELETE FROM trip_feedback;
DELETE FROM approvals;
DELETE FROM trip_requests;
DELETE FROM fuel_records;
DELETE FROM maintenance_requests;
DELETE FROM vehicles;
DELETE FROM drivers;
DELETE FROM workflow_configurations;

UPDATE users SET "departmentId" = NULL, "collegeId" = NULL;
UPDATE colleges SET "headId" = NULL;
UPDATE departments SET "headId" = NULL;
DELETE FROM departments;
DELETE FROM colleges;

COMMIT;
