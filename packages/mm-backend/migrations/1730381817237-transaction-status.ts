import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionStatus1730381817237 implements MigrationInterface {
    name = 'TransactionStatus1730381817237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deposit" ALTER COLUMN "status" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deposit" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    }

}
