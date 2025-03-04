import { MigrationInterface, QueryRunner } from "typeorm";

export class ReadonlyExchangeApiKeyAddUnique1740483326868 implements MigrationInterface {
    name = 'ReadonlyExchangeApiKeyAddUnique1740483326868'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" ADD "clientId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" ADD CONSTRAINT "UQ_fecf0c1ab73b11c0e3658a50a77" UNIQUE ("userId", "clientId", "exchangeName")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" DROP CONSTRAINT "UQ_fecf0c1ab73b11c0e3658a50a77"`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" DROP COLUMN "clientId"`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" DROP COLUMN "userId"`);
    }

}
