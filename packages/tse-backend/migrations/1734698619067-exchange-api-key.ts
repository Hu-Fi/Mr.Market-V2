import { MigrationInterface, QueryRunner } from "typeorm";

export class ExchangeApiKey1734698619067 implements MigrationInterface {
    name = 'ExchangeApiKey1734698619067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exchange_api_key" ("id" SERIAL NOT NULL, "description" character varying, "exchangeName" character varying NOT NULL, "apiKey" character varying NOT NULL, "apiSecret" character varying NOT NULL, "apiPassphrase" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_41b21b80e50de36cd4fb713bd37" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exchange_api_key"`);
    }

}
