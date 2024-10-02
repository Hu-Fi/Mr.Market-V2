import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1726732919779 implements MigrationInterface {
    name = 'Init1726732919779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "operation" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "details" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" integer, CONSTRAINT "PK_18556ee6e49c005fc108078f3ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "exchangeName" character varying NOT NULL, "userId" character varying NOT NULL, "clientId" character varying NOT NULL, "symbol" character varying NOT NULL, "side" character varying NOT NULL, "type" character varying NOT NULL, "amount" numeric(18,10) NOT NULL, "price" numeric(18,10), "status" character varying NOT NULL, "orderExtId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "arbitrage" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "clientId" character varying NOT NULL, "sideA" character varying NOT NULL, "sideB" character varying NOT NULL, "amountToTrade" numeric(10,2) NOT NULL, "minProfitability" numeric(3,2) NOT NULL, "exchangeAName" character varying NOT NULL, "exchangeBName" character varying NOT NULL, "checkIntervalSeconds" integer NOT NULL, "maxOpenOrders" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, CONSTRAINT "PK_9f655fff259fd01401c6a51c430" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "market_making" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "clientId" character varying NOT NULL, "sideA" character varying NOT NULL, "sideB" character varying NOT NULL, "exchangeName" character varying NOT NULL, "bidSpread" numeric(5,2) NOT NULL, "askSpread" numeric(5,2) NOT NULL, "orderAmount" numeric(10,2) NOT NULL, "checkIntervalSeconds" integer NOT NULL, "numberOfLayers" integer NOT NULL, "priceSourceType" character varying NOT NULL, "amountChangePerLayer" numeric(10,2) NOT NULL, "amountChangeType" character varying NOT NULL, "ceilingPrice" integer, "floorPrice" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying NOT NULL, CONSTRAINT "PK_fb2d80e13965340be863a06c516" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "operation" ADD CONSTRAINT "FK_d913212deae3918351f1b76049a" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operation" DROP CONSTRAINT "FK_d913212deae3918351f1b76049a"`);
        await queryRunner.query(`DROP TABLE "market_making"`);
        await queryRunner.query(`DROP TABLE "arbitrage"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "operation"`);
    }

}
