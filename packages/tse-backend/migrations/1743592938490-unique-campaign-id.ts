import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueCampaignId1743592938490 implements MigrationInterface {
    name = 'UniqueCampaignId1743592938490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution" ADD CONSTRAINT "UQ_30128966fec4debce344b2a06da" UNIQUE ("campaignAddress")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution" DROP CONSTRAINT "UQ_30128966fec4debce344b2a06da"`);
    }

}
