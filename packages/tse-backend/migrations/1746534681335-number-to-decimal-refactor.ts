import { MigrationInterface, QueryRunner } from "typeorm";

export class NumberToDecimalRefactor1746534681335 implements MigrationInterface {
    name = 'NumberToDecimalRefactor1746534681335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "amount" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "amount" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "arbitrage" ALTER COLUMN "amountToTrade" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "arbitrage" ALTER COLUMN "amountToTrade" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "orderAmount" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "orderAmount" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "orderAmount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "orderAmount" TYPE numeric(16,8)`);
        await queryRunner.query(`ALTER TABLE "arbitrage" ALTER COLUMN "amountToTrade" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "arbitrage" ALTER COLUMN "amountToTrade" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "amount" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "amount" TYPE numeric(18,10)`);
    }

}
