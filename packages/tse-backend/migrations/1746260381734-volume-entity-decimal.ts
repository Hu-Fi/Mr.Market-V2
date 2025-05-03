import { MigrationInterface, QueryRunner } from "typeorm";

export class VolumeEntityDecimal1746260381734 implements MigrationInterface {
    name = 'VolumeEntityDecimal1746260381734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "volume" ALTER COLUMN "amountToTrade" TYPE numeric(32,16)`);
        await queryRunner.query(`ALTER TABLE "volume" ALTER COLUMN "amountToTrade" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "volume" ALTER COLUMN "amountToTrade" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "volume" ALTER COLUMN "amountToTrade" TYPE numeric(10,2)`);
    }

}
