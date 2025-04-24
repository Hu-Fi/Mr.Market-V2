import { MigrationInterface, QueryRunner } from "typeorm";

export class DecimalPrecision1745443037413 implements MigrationInterface {
    name = 'DecimalPrecision1745443037413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_balance" ALTER COLUMN "balance" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "mixin_deposit" ALTER COLUMN "amount" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "mixin_withdrawal" ALTER COLUMN "amount" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "exchange_deposit" ALTER COLUMN "amount" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "exchange_withdrawal" ALTER COLUMN "amount" TYPE numeric(32,16)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_withdrawal" ALTER COLUMN "amount" TYPE numeric(15,8)`);
        await queryRunner.query(`ALTER TABLE "exchange_deposit" ALTER COLUMN "amount" TYPE numeric(15,8)`);
        await queryRunner.query(`ALTER TABLE "mixin_withdrawal" ALTER COLUMN "amount" TYPE numeric(15,8)`);
        await queryRunner.query(`ALTER TABLE "mixin_deposit" ALTER COLUMN "amount" TYPE numeric(15,8)`);
        await queryRunner.query(`ALTER TABLE "user_balance" ALTER COLUMN "balance" TYPE numeric(15,8)`);
    }

}
