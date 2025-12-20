import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1766222240353 implements MigrationInterface {
    name = 'Chat1766222240353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "selling_entries" DROP CONSTRAINT "FK_7da78dfdc05d49db4bcf01e2b81"`);
        await queryRunner.query(`ALTER TABLE "selling_entries" ADD CONSTRAINT "FK_7da78dfdc05d49db4bcf01e2b81" FOREIGN KEY ("from_currency_id") REFERENCES "currency_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "selling_entries" DROP CONSTRAINT "FK_7da78dfdc05d49db4bcf01e2b81"`);
        await queryRunner.query(`ALTER TABLE "selling_entries" ADD CONSTRAINT "FK_7da78dfdc05d49db4bcf01e2b81" FOREIGN KEY ("from_currency_id") REFERENCES "currency_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
