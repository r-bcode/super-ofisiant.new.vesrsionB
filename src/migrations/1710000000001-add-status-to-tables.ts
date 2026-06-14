import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToTables1710000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "tables_status_enum" AS ENUM ('Free', 'Busy')
    `);

    await queryRunner.query(`
      ALTER TABLE "tables_mi"
      ADD COLUMN "status" "tables_status_enum" NOT NULL DEFAULT 'Free'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tables_mi"
      DROP COLUMN "status"
    `);

    await queryRunner.query(`
      DROP TYPE "tables_status_enum"
    `);
  }
}