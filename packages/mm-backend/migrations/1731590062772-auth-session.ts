import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthSession1731590062772 implements MigrationInterface {
    name = 'AuthSession1731590062772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mixin_auth_session" ("id" SERIAL NOT NULL, "authorizationId" character varying NOT NULL, "publicKey" character varying NOT NULL, "privateKey" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_d154fef9f9fb91a9c63800a87a" UNIQUE ("userId"), CONSTRAINT "PK_232fc93b5a407d5624af052a49e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mixin_auth_session" ADD CONSTRAINT "FK_d154fef9f9fb91a9c63800a87a1" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mixin_auth_session" DROP CONSTRAINT "FK_d154fef9f9fb91a9c63800a87a1"`);
        await queryRunner.query(`DROP TABLE "mixin_auth_session"`);
    }

}
