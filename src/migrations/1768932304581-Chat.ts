import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1768932304581 implements MigrationInterface {
    name = 'Chat1768932304581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ALTER COLUMN "branchCode" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ALTER COLUMN "branchCode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ALTER COLUMN "description" SET NOT NULL`);
    }

}
