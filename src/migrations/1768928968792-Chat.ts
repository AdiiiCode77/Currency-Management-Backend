import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1768928968792 implements MigrationInterface {
    name = 'Chat1768928968792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc"`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc" FOREIGN KEY ("chqBankRefId") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc"`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc" FOREIGN KEY ("chqBankRefId") REFERENCES "chq_ref_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
