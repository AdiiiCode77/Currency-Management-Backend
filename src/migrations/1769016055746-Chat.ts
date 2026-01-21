import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1769016055746 implements MigrationInterface {
    name = 'Chat1769016055746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "contact" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "email" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "address" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "old_account_number" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ALTER COLUMN "description" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ALTER COLUMN "chqNo" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "contact" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "contact" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "address" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "address" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "old_account_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "old_account_id" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "general_accounts" ALTER COLUMN "account_information" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "general_accounts" ALTER COLUMN "account_information" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "father_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "cnic" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" DROP CONSTRAINT "UQ_071c757e9b94da16f98459a395d"`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "contact" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "address" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "monthly_salary" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "joining_date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "joining_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "monthly_salary" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "address" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "contact" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ADD CONSTRAINT "UQ_071c757e9b94da16f98459a395d" UNIQUE ("cnic")`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "cnic" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee_accounts" ALTER COLUMN "father_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "general_accounts" ALTER COLUMN "account_information" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "general_accounts" ALTER COLUMN "account_information" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "old_account_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "old_account_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "address" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "address" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "contact" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bank_accounts" ALTER COLUMN "contact" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ALTER COLUMN "chqNo" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ALTER COLUMN "description" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "old_account_number" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "address" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "email" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "contact" DROP DEFAULT`);
    }

}
