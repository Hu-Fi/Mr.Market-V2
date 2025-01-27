import { MigrationInterface, QueryRunner } from "typeorm";

export class Web3Identity1737732258453 implements MigrationInterface {
    name = 'Web3Identity1737732258453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "web3_identity_key" ("id" SERIAL NOT NULL, "privateKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ec8173a36857981eba33d083fde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "web3_identity_rpc" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "rpcUrl" character varying NOT NULL, "removed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3a5c7d95c70c04a9dd5b679497" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "web3_identity_rpc"`);
        await queryRunner.query(`DROP TABLE "web3_identity_key"`);
    }

}
