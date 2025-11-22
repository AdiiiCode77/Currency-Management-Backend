import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1763831922830 implements MigrationInterface {
    name = 'Chat1763831922830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" DROP CONSTRAINT "FK_ef77403b48f4521ae5de090af95"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" DROP CONSTRAINT "FK_b3aae41e6e17d56c464a4666f74"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" RENAME COLUMN "drAccountId" TO "bankAccountId"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" RENAME COLUMN "crAccountId" TO "bankAccountId"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ADD CONSTRAINT "FK_231dd22152513a54a93dae9ac8b" FOREIGN KEY ("bankAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" ADD CONSTRAINT "FK_99ebfb838eb8eafb6c53aa06df4" FOREIGN KEY ("bankAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" DROP CONSTRAINT "FK_99ebfb838eb8eafb6c53aa06df4"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" DROP CONSTRAINT "FK_231dd22152513a54a93dae9ac8b"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" RENAME COLUMN "bankAccountId" TO "crAccountId"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" RENAME COLUMN "bankAccountId" TO "drAccountId"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" ADD CONSTRAINT "FK_b3aae41e6e17d56c464a4666f74" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ADD CONSTRAINT "FK_ef77403b48f4521ae5de090af95" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
