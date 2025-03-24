import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthImprovments1742822856669 implements MigrationInterface {
    name = 'AuthImprovments1742822856669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "identityNumber"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarUrl"`);
        await queryRunner.query(`ALTER TABLE "mixin_auth_session" ADD "clientId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mixin_auth_session" DROP COLUMN "clientId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "identityNumber" character varying NOT NULL`);
    }

}
