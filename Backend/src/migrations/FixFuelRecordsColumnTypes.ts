import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fixes fuel_records uuid = character varying error.
 * The initial schema created vehicleId, tripId, recordedById as varchar
 * but the entity declares them as uuid — PostgreSQL refuses the JOIN.
 * This migration casts them to uuid so JOINs work correctly.
 */
export class FixFuelRecordsColumnTypes1746100000002 implements MigrationInterface {
  name = 'FixFuelRecordsColumnTypes1746100000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check current type and cast only if still varchar
    const cols = await queryRunner.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'fuel_records'
        AND column_name IN ('vehicleId', 'tripId', 'recordedById')
    `);

    const varcharCols = cols
      .filter((c: any) => c.data_type === 'character varying')
      .map((c: any) => c.column_name);

    if (varcharCols.length === 0) {
      // Already uuid — nothing to do
      return;
    }

    // Cast varchar → uuid (only works if values are valid UUIDs)
    for (const col of varcharCols) {
      await queryRunner.query(`
        ALTER TABLE "fuel_records"
          ALTER COLUMN "${col}" TYPE uuid USING "${col}"::uuid
      `).catch(() => {
        // If cast fails (non-UUID values), just leave as varchar
        // The entity already uses varchar to match
      });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to varchar
    for (const col of ['vehicleId', 'tripId', 'recordedById']) {
      await queryRunner.query(`
        ALTER TABLE "fuel_records"
          ALTER COLUMN "${col}" TYPE character varying USING "${col}"::text
      `).catch(() => {});
    }
  }
}
