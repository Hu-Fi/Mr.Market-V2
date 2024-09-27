import { MigrationInterface, QueryRunner } from "typeorm";

export class Withdrawal1727445948213 implements MigrationInterface {
    name = 'Withdrawal1727445948213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "withdraw" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "amount" numeric(15,8) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5c172f81689173f75bf5906ef22" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "withdraw"`);
    }

}
