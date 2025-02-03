import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignContribution1738587942168 implements MigrationInterface {
    name = 'CampaignContribution1738587942168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contribution" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "exchangeName" character varying NOT NULL, "campaignAddress" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_878330fa5bb34475732a5883d58" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "contribution"`);
    }

}
