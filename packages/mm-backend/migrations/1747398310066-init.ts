import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747398310066 implements MigrationInterface {
    name = 'Init1747398310066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mixin_auth_session" ("id" SERIAL NOT NULL, "clientId" character varying NOT NULL, "authorizationId" character varying NOT NULL, "publicKey" character varying NOT NULL, "privateKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_d154fef9f9fb91a9c63800a87a" UNIQUE ("userId"), CONSTRAINT "PK_232fc93b5a407d5624af052a49e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mixin_deposit" ("id" SERIAL NOT NULL, "assetId" character varying NOT NULL, "chainId" character varying NOT NULL, "amount" numeric(32,16) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL, "transactionHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_716d6e751ffea2a79e78585c8b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mixin_withdrawal" ("id" SERIAL NOT NULL, "assetId" character varying NOT NULL, "amount" numeric(32,16) NOT NULL DEFAULT '0', "destination" character varying NOT NULL, "status" character varying NOT NULL, "transactionHash" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_697a92cfe22335cb4efe3b27ff2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL, "type" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d72ea127f30e21753c9e229891e" UNIQUE ("userId"), CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "mixin_auth_session" ADD CONSTRAINT "FK_d154fef9f9fb91a9c63800a87a1" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mixin_deposit" ADD CONSTRAINT "FK_e031b71f2fec9fc95c162af01b7" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mixin_withdrawal" ADD CONSTRAINT "FK_41a03136244efa0733ce38ebed3" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mixin_withdrawal" DROP CONSTRAINT "FK_41a03136244efa0733ce38ebed3"`);
        await queryRunner.query(`ALTER TABLE "mixin_deposit" DROP CONSTRAINT "FK_e031b71f2fec9fc95c162af01b7"`);
        await queryRunner.query(`ALTER TABLE "mixin_auth_session" DROP CONSTRAINT "FK_d154fef9f9fb91a9c63800a87a1"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "mixin_withdrawal"`);
        await queryRunner.query(`DROP TABLE "mixin_deposit"`);
        await queryRunner.query(`DROP TABLE "mixin_auth_session"`);
    }

}
