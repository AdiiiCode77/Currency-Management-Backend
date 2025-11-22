import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1763752874132 implements MigrationInterface {
    name = 'Chat1763752874132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_currency_accounts" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "customer_currency_accounts" ADD "balance" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_currency_accounts" DROP COLUMN "balance"`);
        await queryRunner.query(`ALTER TABLE "customer_currency_accounts" ADD "balance" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

}
