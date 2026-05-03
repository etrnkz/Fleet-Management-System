import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fixes numeric overflow errors in gps_locations:
 *   accuracy decimal(4,2) → decimal(8,2)  — GPS accuracy can be 100-500m
 *   speed    decimal(5,2) → decimal(6,2)  — allow up to 9999 km/h
 *   heading  decimal(5,2) → decimal(6,2)
 *   altitude decimal(6,2) → decimal(8,2)  — allow high altitudes
 */
export class FixGpsLocationColumnPrecision1746100000001 implements MigrationInterface {
  name = 'FixGpsLocationColumnPrecision1746100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gps_locations"
        ALTER COLUMN "accuracy" TYPE decimal(8,2),
        ALTER COLUMN "speed"    TYPE decimal(6,2),
        ALTER COLUMN "heading"  TYPE decimal(6,2),
        ALTER COLUMN "altitude" TYPE decimal(8,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "gps_locations"
        ALTER COLUMN "accuracy" TYPE decimal(4,2),
        ALTER COLUMN "speed"    TYPE decimal(5,2),
        ALTER COLUMN "heading"  TYPE decimal(5,2),
        ALTER COLUMN "altitude" TYPE decimal(6,2)
    `);
  }
}
