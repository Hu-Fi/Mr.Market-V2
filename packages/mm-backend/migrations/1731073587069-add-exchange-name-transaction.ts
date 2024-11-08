import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExchangeNameTransaction1731073587069 implements MigrationInterface {
    name = 'AddExchangeNameTransaction1731073587069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_deposit" ADD "exchangeName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exchange_withdrawal" ADD "exchangeName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_withdrawal" DROP COLUMN "exchangeName"`);
        await queryRunner.query(`ALTER TABLE "exchange_deposit" DROP COLUMN "exchangeName"`);
    }

}
