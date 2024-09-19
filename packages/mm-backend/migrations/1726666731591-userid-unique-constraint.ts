import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToUserUserId1726666731591 implements MigrationInterface {
  name = 'AddUniqueConstraintToUserUserId1726666731591'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_user_userId" UNIQUE ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_user_userId"`);
  }
}
