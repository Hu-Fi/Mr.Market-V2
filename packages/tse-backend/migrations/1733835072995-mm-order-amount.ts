import { MigrationInterface, QueryRunner } from "typeorm";

export class MmOrderAmount1733835072995 implements MigrationInterface {
    name = 'MmOrderAmount1733835072995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "orderAmount" TYPE numeric(16,8)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "market_making" ALTER COLUMN "orderAmount" TYPE numeric(10,2)`);
    }

}
