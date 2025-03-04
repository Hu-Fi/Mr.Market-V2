import { MigrationInterface, QueryRunner } from "typeorm";

export class ReadonlyExchangeApiKey1740481472603 implements MigrationInterface {
    name = 'ReadonlyExchangeApiKey1740481472603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exchange_api_key_read_only" ("id" SERIAL NOT NULL, "exchangeName" character varying NOT NULL, "apiKey" character varying NOT NULL, "apiSecret" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_893709482380f6c385c752c0ed7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exchange_api_key_read_only"`);
    }

}
