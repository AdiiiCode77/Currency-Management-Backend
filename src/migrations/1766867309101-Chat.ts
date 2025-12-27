import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1766867309101 implements MigrationInterface {
    name = 'Chat1766867309101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "currency_stocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "currency_id" uuid NOT NULL, "admin_id" uuid NOT NULL, "stock_amount_pkr" numeric(30,2) NOT NULL DEFAULT '0', "currency_amount" numeric(30,2) NOT NULL DEFAULT '0', "rate" numeric(18,6) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f413c8599e059bcc1594b32220d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "currency_stocks"`);
    }

}
