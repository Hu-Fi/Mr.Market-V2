import { MigrationInterface, QueryRunner } from "typeorm";

export class Deposit1727177277981 implements MigrationInterface {
    name = 'Deposit1727177277981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "deposit" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "chainId" character varying NOT NULL, "amount" numeric(15,8) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6654b4be449dadfd9d03a324b61" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "deposit"`);
    }

}
