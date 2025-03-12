import { MigrationInterface, QueryRunner } from "typeorm";

export class VolumeStrategy1741696173633 implements MigrationInterface {
    name = 'VolumeStrategy1741696173633'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "volume" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "clientId" character varying NOT NULL, "exchangeName" character varying NOT NULL, "sideA" character varying NOT NULL, "sideB" character varying NOT NULL, "amountToTrade" numeric(10,2) NOT NULL, "incrementPercentage" numeric(5,2) NOT NULL, "tradeIntervalSeconds" integer NOT NULL, "numTotalTrades" integer NOT NULL, "pricePushRate" numeric(5,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "lastTradingAttemptAt" TIMESTAMP, "pausedReason" character varying, CONSTRAINT "PK_666025cd0c36727216bb7f2a680" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" ADD "clientId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" ADD "isDefaultAccount" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" ADD "apiPassphrase" character varying`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" ADD CONSTRAINT "UQ_440bbdf6d1a214d65bf0ec1534d" UNIQUE ("userId", "clientId", "exchangeName")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_api_key" DROP CONSTRAINT "UQ_440bbdf6d1a214d65bf0ec1534d"`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key_read_only" DROP COLUMN "apiPassphrase"`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" DROP COLUMN "isDefaultAccount"`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" DROP COLUMN "clientId"`);
        await queryRunner.query(`ALTER TABLE "exchange_api_key" DROP COLUMN "userId"`);
        await queryRunner.query(`DROP TABLE "volume"`);
    }

}
