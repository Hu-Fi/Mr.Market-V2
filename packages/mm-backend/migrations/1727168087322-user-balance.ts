import { MigrationInterface, QueryRunner } from "typeorm";

export class UserBalance1727168087322 implements MigrationInterface {
    name = 'UserBalance1727168087322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_balance" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "balance" numeric(15,8) NOT NULL DEFAULT '0', CONSTRAINT "PK_f3edf5a1907e7b430421b9c2ddd" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_balance"`);
    }

}
