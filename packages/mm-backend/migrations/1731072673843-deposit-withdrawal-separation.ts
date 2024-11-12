import { MigrationInterface, QueryRunner } from "typeorm";

export class DepositWithdrawalSeparation1731072673843 implements MigrationInterface {
    name = 'DepositWithdrawalSeparation1731072673843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mixin_deposit" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "chainId" character varying NOT NULL, "amount" numeric(15,8) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL, "transactionHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_716d6e751ffea2a79e78585c8b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mixin_withdrawal" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "amount" numeric(15,8) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL, "transactionHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_697a92cfe22335cb4efe3b27ff2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exchange_deposit" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "chainId" character varying NOT NULL, "amount" numeric(15,8) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL, "transactionHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b13498118c0bfedd36c6c4761a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exchange_withdrawal" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "amount" numeric(15,8) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL, "transactionHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_89bc31cb50afb211a8d07fbcf6f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "exchange_withdrawal"`);
        await queryRunner.query(`DROP TABLE "exchange_deposit"`);
        await queryRunner.query(`DROP TABLE "mixin_withdrawal"`);
        await queryRunner.query(`DROP TABLE "mixin_deposit"`);
    }

}
