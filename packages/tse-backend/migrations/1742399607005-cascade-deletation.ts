import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeDeletation1742399607005 implements MigrationInterface {
    name = 'CascadeDeletation1742399607005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation" DROP CONSTRAINT "FK_d913212deae3918351f1b76049a"`);
        await queryRunner.query(`ALTER TABLE "operation" ADD CONSTRAINT "FK_d913212deae3918351f1b76049a" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation" DROP CONSTRAINT "FK_d913212deae3918351f1b76049a"`);
        await queryRunner.query(`ALTER TABLE "operation" ADD CONSTRAINT "FK_d913212deae3918351f1b76049a" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
