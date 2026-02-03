import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentToOrders1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orderswowfood"
      ADD COLUMN "comment" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orderswowfood"
      DROP COLUMN "comment"
    `);
  }
}
