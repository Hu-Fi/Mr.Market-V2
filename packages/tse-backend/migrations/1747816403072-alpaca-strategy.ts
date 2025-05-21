import { MigrationInterface, QueryRunner } from "typeorm";

export class AlpacaStrategy1747816403072 implements MigrationInterface {
    name = 'AlpacaStrategy1747816403072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "strategy_alpaca" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "clientId" character varying NOT NULL, "exchangeName" character varying NOT NULL, "derivativeType" character varying NOT NULL, "sideA" character varying NOT NULL, "sideB" character varying NOT NULL, "amountToTrade" numeric(32,16) NOT NULL DEFAULT '0', "minProfitability" integer NOT NULL, "checkIntervalSeconds" integer NOT NULL, "maxOpenOrders" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "lastTradingAttemptAt" TIMESTAMP, "pausedReason" character varying, CONSTRAINT "PK_c8ef70454a0a87c7a64e22f8806" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "strategy_alpaca"`);
    }

}
