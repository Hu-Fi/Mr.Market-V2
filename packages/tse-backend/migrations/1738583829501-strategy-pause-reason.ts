import { MigrationInterface, QueryRunner } from "typeorm";

export class StrategyPauseReason1738583829501 implements MigrationInterface {
    name = 'StrategyPauseReason1738583829501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "arbitrage" ADD "pausedReason" character varying`);
        await queryRunner.query(`ALTER TABLE "market_making" ADD "pausedReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" DROP COLUMN "pausedReason"`);
        await queryRunner.query(`ALTER TABLE "arbitrage" DROP COLUMN "pausedReason"`);
    }

}
