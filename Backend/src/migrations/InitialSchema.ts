import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Placeholder migration — schema is managed by TypeORM synchronize in development.
    // Replace with generated SQL for production deployments.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Placeholder — no-op.
  }
}
