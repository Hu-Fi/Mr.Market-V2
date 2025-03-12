import { MigrationInterface, QueryRunner } from "typeorm";

export class VolumeStrategyLastTradeData1741776880358 implements MigrationInterface {
    name = 'VolumeStrategyLastTradeData1741776880358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "volume" ADD "tradesExecuted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "volume" ADD "currentMakerPrice" numeric(12,6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "volume" DROP COLUMN "currentMakerPrice"`);
        await queryRunner.query(`ALTER TABLE "volume" DROP COLUMN "tradesExecuted"`);
    }

}
