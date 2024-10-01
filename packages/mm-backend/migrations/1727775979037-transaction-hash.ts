import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionHash1727775979037 implements MigrationInterface {
    name = 'TransactionHash1727775979037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deposit" ADD "transactionHash" character varying`);
        await queryRunner.query(`ALTER TABLE "withdraw" ADD "transactionHash" character varying`);
        await queryRunner.query(`ALTER TABLE "withdraw" ALTER COLUMN "status" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "withdraw" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "withdraw" DROP COLUMN "transactionHash"`);
        await queryRunner.query(`ALTER TABLE "deposit" DROP COLUMN "transactionHash"`);
    }

}
