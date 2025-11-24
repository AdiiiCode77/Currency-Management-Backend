import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1763914271199 implements MigrationInterface {
    name = 'Chat1763914271199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_currency_entries" ADD "balance" numeric(30,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_currency_entries" DROP COLUMN "balance"`);
    }

}
