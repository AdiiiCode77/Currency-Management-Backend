import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1768930559579 implements MigrationInterface {
    name = 'Chat1768930559579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."general_ledger_account_type_enum" AS ENUM('CUSTOMER', 'BANK', 'CURRENCY', 'GENERAL')`);
        await queryRunner.query(`CREATE TYPE "public"."general_ledger_entry_type_enum" AS ENUM('SALE', 'PURCHASE', 'JOURNAL', 'BANK_PAYMENT', 'BANK_RECEIPT', 'CASH_PAYMENT', 'CASH_RECEIPT', 'CHQ_INWARD', 'CHQ_OUTWARD', 'CURRENCY_ENTRY', 'CURRENCY_JOURNAL')`);
        await queryRunner.query(`CREATE TABLE "general_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "admin_id" uuid NOT NULL, "transaction_date" date NOT NULL, "account_id" uuid NOT NULL, "account_name" character varying(255) NOT NULL, "account_type" "public"."general_ledger_account_type_enum" NOT NULL, "entry_type" "public"."general_ledger_entry_type_enum" NOT NULL, "source_entry_id" uuid NOT NULL, "reference_number" character varying(100), "debit_amount" numeric(30,2) NOT NULL DEFAULT '0', "credit_amount" numeric(30,2) NOT NULL DEFAULT '0', "currency_amount" numeric(30,2), "currency_code" character varying(10), "exchange_rate" numeric(30,6), "description" text, "payment_type" character varying(50), "contra_account_id" uuid, "contra_account_name" character varying(255), "running_balance" numeric(30,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a148029e2181866d8a7fe139981" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_670e5e996955989b767bad615e" ON "general_ledger" ("source_entry_id", "entry_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_236ca4d65be8c18fa4787cec01" ON "general_ledger" ("admin_id", "transaction_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_2ad0bbd60669f04c44f70c167e" ON "general_ledger" ("admin_id", "entry_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_a9a35bddb4cccc01383de87fbc" ON "general_ledger" ("admin_id", "account_id", "transaction_date") `);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "contact" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "address" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "old_account_number" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "old_account_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "address" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customer_accounts" ALTER COLUMN "contact" SET NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9a35bddb4cccc01383de87fbc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2ad0bbd60669f04c44f70c167e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_236ca4d65be8c18fa4787cec01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_670e5e996955989b767bad615e"`);
        await queryRunner.query(`DROP TABLE "general_ledger"`);
        await queryRunner.query(`DROP TYPE "public"."general_ledger_entry_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."general_ledger_account_type_enum"`);
    }

}
