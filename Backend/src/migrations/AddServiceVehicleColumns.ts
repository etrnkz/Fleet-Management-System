import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds service vehicle columns to the vehicles table:
 *   - isServiceVehicle  (shuttle/security vehicles that bypass the trip workflow)
 *   - serviceVehicleType
 *   - serviceSchedule
 *   - serviceRoute
 */
export class AddServiceVehicleColumns1746000000001 implements MigrationInterface {
  name = 'AddServiceVehicleColumns1746000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add isServiceVehicle column (default false — existing vehicles are not service vehicles)
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "isServiceVehicle" boolean NOT NULL DEFAULT false
    `);

    // Add serviceVehicleType column (nullable varchar — only set when isServiceVehicle = true)
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "serviceVehicleType" character varying
    `);

    // Add serviceSchedule column (nullable text)
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "serviceSchedule" text
    `);

    // Add serviceRoute column (nullable text)
    await queryRunner.query(`
      ALTER TABLE "vehicles"
      ADD COLUMN IF NOT EXISTS "serviceRoute" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "serviceRoute"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "serviceSchedule"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "serviceVehicleType"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "isServiceVehicle"`);
  }
}
