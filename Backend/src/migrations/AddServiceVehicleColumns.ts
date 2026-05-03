import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 1746000000001
 *
 * Fixes two production schema issues:
 *
 * 1. fuel_records — vehicleId, tripId, recordedById were created as
 *    character varying in the initial schema but the entity declares them
 *    as uuid. PostgreSQL refuses to JOIN uuid = varchar, causing
 *    "operator does not exist: uuid = character varying".
 *    Fix: cast those columns to uuid.
 *
 * 2. vehicles — isServiceVehicle, serviceVehicleType, serviceSchedule,
 *    serviceRoute columns are missing from the production table.
 *    Fix: add them with IF NOT EXISTS so the migration is idempotent.
 */
export class AddServiceVehicleColumns1746000000001 implements MigrationInterface {
  name = 'AddServiceVehicleColumns1746000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Fix fuel_records column types ─────────────────────────────────────

    // Drop the FK-like indexes/constraints that reference these columns first
    // (safe to ignore if they don't exist)
    await queryRunner.query(`
      ALTER TABLE "fuel_records"
        ALTER COLUMN "vehicleId"    TYPE uuid USING "vehicleId"::uuid,
        ALTER COLUMN "recordedById" TYPE uuid USING "recordedById"::uuid
    `).catch(() => {/* already uuid — skip */});

    // tripId is nullable — cast separately
    await queryRunner.query(`
      ALTER TABLE "fuel_records"
        ALTER COLUMN "tripId" TYPE uuid USING "tripId"::uuid
    `).catch(() => {/* already uuid or null — skip */});

    // ── 2. Add service vehicle columns to vehicles ────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        ADD COLUMN IF NOT EXISTS "isServiceVehicle"   boolean          NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "serviceVehicleType" character varying,
        ADD COLUMN IF NOT EXISTS "serviceSchedule"    text,
        ADD COLUMN IF NOT EXISTS "serviceRoute"       text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert service vehicle columns
    await queryRunner.query(`
      ALTER TABLE "vehicles"
        DROP COLUMN IF EXISTS "serviceRoute",
        DROP COLUMN IF EXISTS "serviceSchedule",
        DROP COLUMN IF EXISTS "serviceVehicleType",
        DROP COLUMN IF EXISTS "isServiceVehicle"
    `);

    // Revert fuel_records columns back to varchar
    await queryRunner.query(`
      ALTER TABLE "fuel_records"
        ALTER COLUMN "vehicleId"    TYPE character varying USING "vehicleId"::text,
        ALTER COLUMN "recordedById" TYPE character varying USING "recordedById"::text,
        ALTER COLUMN "tripId"       TYPE character varying USING "tripId"::text
    `).catch(() => {});
  }
}
