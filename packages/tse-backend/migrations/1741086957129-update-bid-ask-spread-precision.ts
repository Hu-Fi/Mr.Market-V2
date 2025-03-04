import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBidAskSpreadPrecision1741086957129 implements MigrationInterface {
    name = 'UpdateBidAskSpreadPrecision1741086957129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "bidSpread" TYPE numeric(6,3)`);
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "askSpread" TYPE numeric(6,3)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "askSpread" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "bidSpread" TYPE numeric(5,2)`);
    }

}
