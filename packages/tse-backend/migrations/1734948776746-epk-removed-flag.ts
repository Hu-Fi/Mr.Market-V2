import { MigrationInterface, QueryRunner } from "typeorm";

export class EpkRemovedFlag1734948776746 implements MigrationInterface {
    name = 'EpkRemovedFlag1734948776746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_api_key" ADD "removed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exchange_api_key" DROP COLUMN "removed"`);
    }

}
