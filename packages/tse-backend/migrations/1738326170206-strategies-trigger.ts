import { MigrationInterface, QueryRunner } from "typeorm";

export class StrategiesTrigger1738326170206 implements MigrationInterface {
    name = 'StrategiesTrigger1738326170206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "arbitrage" ADD "lastTradingAttemptAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "market_making" ADD "lastTradingAttemptAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" DROP COLUMN "lastTradingAttemptAt"`);
        await queryRunner.query(`ALTER TABLE "arbitrage" DROP COLUMN "lastTradingAttemptAt"`);
    }

}
