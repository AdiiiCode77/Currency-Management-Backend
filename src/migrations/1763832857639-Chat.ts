import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1763832857639 implements MigrationInterface {
    name = 'Chat1763832857639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" DROP CONSTRAINT "FK_231dd22152513a54a93dae9ac8b"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" DROP CONSTRAINT "FK_99ebfb838eb8eafb6c53aa06df4"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ADD CONSTRAINT "FK_231dd22152513a54a93dae9ac8b" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" ADD CONSTRAINT "FK_99ebfb838eb8eafb6c53aa06df4" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" DROP CONSTRAINT "FK_99ebfb838eb8eafb6c53aa06df4"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" DROP CONSTRAINT "FK_231dd22152513a54a93dae9ac8b"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" ADD CONSTRAINT "FK_99ebfb838eb8eafb6c53aa06df4" FOREIGN KEY ("bankAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ADD CONSTRAINT "FK_231dd22152513a54a93dae9ac8b" FOREIGN KEY ("bankAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
