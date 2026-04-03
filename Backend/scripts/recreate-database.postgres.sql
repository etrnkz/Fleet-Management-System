-- Recreate fleet_management from scratch (all data removed).
-- Run connected to database "postgres" as a superuser, e.g.:
--   psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -f scripts/recreate-database.postgres.sql
--
-- To use another DB name, edit the three occurrences below or use recreate-database.sh with env vars.

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'fleet_management'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS fleet_management;
CREATE DATABASE fleet_management;
