import { MigrationInterface, QueryRunner } from "typeorm";

export class AlpacaStrategy1743089607778 implements MigrationInterface {
    name = 'AlpacaStrategy1743089607778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alpaca" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "clientId" character varying NOT NULL, "exchangeName" character varying NOT NULL, "sideA" character varying NOT NULL, "sideB" character varying NOT NULL, "amountToTrade" numeric(10,2) NOT NULL, "minProfitability" numeric(3,2) NOT NULL, "checkIntervalSeconds" integer NOT NULL, "maxOpenOrders" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, "lastTradingAttemptAt" TIMESTAMP, "pausedReason" character varying, CONSTRAINT "PK_9cddc9fd5eba299add24df56f17" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "alpaca"`);
    }

}
