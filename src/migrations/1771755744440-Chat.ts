import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1771755744440 implements MigrationInterface {
    name = 'Chat1771755744440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc"`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" DROP CONSTRAINT "FK_1cb70623de857c14d24570da3bc"`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc" FOREIGN KEY ("chqBankRefId") REFERENCES "chq_ref_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" ADD CONSTRAINT "FK_1cb70623de857c14d24570da3bc" FOREIGN KEY ("chqBankRefId") REFERENCES "chq_ref_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" DROP CONSTRAINT "FK_1cb70623de857c14d24570da3bc"`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc"`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" ADD CONSTRAINT "FK_1cb70623de857c14d24570da3bc" FOREIGN KEY ("chqBankRefId") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc" FOREIGN KEY ("chqBankRefId") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
