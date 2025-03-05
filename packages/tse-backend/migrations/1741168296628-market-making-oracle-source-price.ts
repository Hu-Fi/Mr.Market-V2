import { MigrationInterface, QueryRunner } from "typeorm";

export class MarketMakingOracleSourcePrice1741168296628 implements MigrationInterface {
    name = 'MarketMakingOracleSourcePrice1741168296628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" ADD "oracleExchangeName" character varying`);
        await queryRunner.query(`ALTER TABLE "market_making" ADD "startPrice" numeric(16,8) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" DROP COLUMN "startPrice"`);
        await queryRunner.query(`ALTER TABLE "market_making" DROP COLUMN "oracleExchangeName"`);
    }

}
