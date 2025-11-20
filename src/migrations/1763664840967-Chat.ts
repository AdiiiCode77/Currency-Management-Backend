import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1763664840967 implements MigrationInterface {
    name = 'Chat1763664840967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cash_received_entries" DROP CONSTRAINT "FK_0bbc9a59598f020fdb9e774eb69"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" DROP CONSTRAINT "FK_ea136cd030da26098b2ce3788b8"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" RENAME COLUMN "drAccountId" TO "drAccount"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" RENAME COLUMN "crAccountId" TO "crAccount"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" DROP COLUMN "drAccount"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ADD "drAccount" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" DROP COLUMN "crAccount"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ADD "crAccount" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" DROP COLUMN "crAccount"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ADD "crAccount" uuid`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" DROP COLUMN "drAccount"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ADD "drAccount" uuid`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" RENAME COLUMN "crAccount" TO "crAccountId"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" RENAME COLUMN "drAccount" TO "drAccountId"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ADD CONSTRAINT "FK_ea136cd030da26098b2ce3788b8" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ADD CONSTRAINT "FK_0bbc9a59598f020fdb9e774eb69" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
