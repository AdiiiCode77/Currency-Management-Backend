import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseMig1766685727726 implements MigrationInterface {
    name = 'PurchaseMig1766685727726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD "from_currency_id" uuid`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD CONSTRAINT "FK_f446c365ca2124dba854d7d5e44" FOREIGN KEY ("from_currency_id") REFERENCES "currency_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP CONSTRAINT "FK_f446c365ca2124dba854d7d5e44"`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP COLUMN "from_currency_id"`);
    }

}
