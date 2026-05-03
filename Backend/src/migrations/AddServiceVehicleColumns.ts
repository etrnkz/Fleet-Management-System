import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 1746000000001
 *
 * 1. vehicles — adds isServiceVehicle, serviceVehicleType, serviceSchedule,
 *    serviceRoute columns (IF NOT EXISTS — safe to re-run).
 *
 * 2. fuel_records — vehicleId, tripId, recordedById were created as
 *    character varying in the initial schema. The entity now declares them
 *    as varchar too (matching the DB), so no cast is needed here.
 *    This migration only handles the vehicles columns.
 */
export class AddServiceVehicleColumns1746000000001 implements MigrationInterface {
  name = 'AddServiceVehicleColumns1746000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check and add each column individually to avoid partial-failure issues
    const table = await queryRunner.getTable('vehicles');

    if (!table?.findColumnByName('isServiceVehicle')) {
      await queryRunner.query(
        `ALTER TABLE "vehicles" ADD COLUMN "isServiceVehicle" boolean NOT NULL DEFAULT false`,
      );
    }

    if (!table?.findColumnByName('serviceVehicleType')) {
      await queryRunner.query(
        `ALTER TABLE "vehicles" ADD COLUMN "serviceVehicleType" character varying`,
      );
    }

    if (!table?.findColumnByName('serviceSchedule')) {
      await queryRunner.query(
        `ALTER TABLE "vehicles" ADD COLUMN "serviceSchedule" text`,
      );
    }

    if (!table?.findColumnByName('serviceRoute')) {
      await queryRunner.query(
        `ALTER TABLE "vehicles" ADD COLUMN "serviceRoute" text`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "serviceRoute"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "serviceSchedule"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "serviceVehicleType"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "isServiceVehicle"`);
  }
}
