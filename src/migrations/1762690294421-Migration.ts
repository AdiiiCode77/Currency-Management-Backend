import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762690294421 implements MigrationInterface {
    name = 'Migration1762690294421'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "selling_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "s_no" character varying, "avgRate" numeric(12,4) NOT NULL, "manual_ref" character varying, "amountCurrency" numeric(12,2) NOT NULL, "rate" numeric(12,4) NOT NULL, "amountPkr" numeric(12,2) NOT NULL, "margin" numeric(12,2) NOT NULL, "pl" numeric(12,2) NOT NULL, "description" text, "admin_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "from_currency_id" uuid, "customer_account_id" uuid, CONSTRAINT "PK_1837b69bb78f6d3691b0384ab8a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "purchase_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "manual_ref" character varying, "amountCurrency" numeric(12,2) NOT NULL, "rate" numeric(12,4) NOT NULL, "amountPkr" numeric(12,2) NOT NULL, "description" text, "admin_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "currency_dr_id" uuid, "customer_account_id" uuid, CONSTRAINT "PK_855deccd642f64ee8b4db0af2b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chq_outward_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entryDate" date NOT NULL, "chqDate" date NOT NULL, "amount" numeric NOT NULL, "chqNumber" character varying NOT NULL, "adminId" character varying NOT NULL, "fromAccountId" uuid, "toAccountId" uuid, "chqBankRefId" uuid, CONSTRAINT "PK_a4019fae0224a0e964035686f4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."customer_currency_accounts_accounttype_enum" AS ENUM('Customer', 'Asset', 'Capital', 'Cash', 'Income', 'Liability', 'Employee', 'Personal Account', 'Partnership Account', 'Property Account', 'Stock Account', 'Others')`);
        await queryRunner.query(`CREATE TABLE "customer_currency_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountType" "public"."customer_currency_accounts_accounttype_enum" NOT NULL, "name" character varying NOT NULL, "accountInfo" text, "admin_id" uuid NOT NULL, "balance" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_431c61e7054628a10e4cef71ebd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."general_accounts_account_type_enum" RENAME TO "general_accounts_account_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."general_accounts_account_type_enum" AS ENUM('Customer', 'Asset', 'Capital', 'Cash', 'Income', 'Liability', 'Employee', 'Personal Account', 'Partnership Account', 'Property Account', 'Stock Account', 'Others')`);
        await queryRunner.query(`ALTER TABLE "general_accounts" ALTER COLUMN "account_type" TYPE "public"."general_accounts_account_type_enum" USING "account_type"::"text"::"public"."general_accounts_account_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."general_accounts_account_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "selling_entries" ADD CONSTRAINT "FK_7da78dfdc05d49db4bcf01e2b81" FOREIGN KEY ("from_currency_id") REFERENCES "currency_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "selling_entries" ADD CONSTRAINT "FK_7e660ce1a5e9fe48cf802958f5f" FOREIGN KEY ("customer_account_id") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD CONSTRAINT "FK_bcbfc38fd4cf188b03a4d77aedc" FOREIGN KEY ("currency_dr_id") REFERENCES "currency_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD CONSTRAINT "FK_6680415af33de154fef9e0f18aa" FOREIGN KEY ("customer_account_id") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_e5c9cee1dcbc9709927e2099e51" FOREIGN KEY ("fromAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_6e34daed5aea0c53d760296d6e8" FOREIGN KEY ("toAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" ADD CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc" FOREIGN KEY ("chqBankRefId") REFERENCES "chq_ref_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_5c763b9575c2a35bda9a61117fc"`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_6e34daed5aea0c53d760296d6e8"`);
        await queryRunner.query(`ALTER TABLE "chq_outward_entries" DROP CONSTRAINT "FK_e5c9cee1dcbc9709927e2099e51"`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP CONSTRAINT "FK_6680415af33de154fef9e0f18aa"`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP CONSTRAINT "FK_bcbfc38fd4cf188b03a4d77aedc"`);
        await queryRunner.query(`ALTER TABLE "selling_entries" DROP CONSTRAINT "FK_7e660ce1a5e9fe48cf802958f5f"`);
        await queryRunner.query(`ALTER TABLE "selling_entries" DROP CONSTRAINT "FK_7da78dfdc05d49db4bcf01e2b81"`);
        await queryRunner.query(`CREATE TYPE "public"."general_accounts_account_type_enum_old" AS ENUM('Asset', 'Capital', 'Cash', 'Income', 'Liability', 'Employee', 'Personal Account', 'Partnership Account', 'Property Account', 'Stock Account', 'Others')`);
        await queryRunner.query(`ALTER TABLE "general_accounts" ALTER COLUMN "account_type" TYPE "public"."general_accounts_account_type_enum_old" USING "account_type"::"text"::"public"."general_accounts_account_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."general_accounts_account_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."general_accounts_account_type_enum_old" RENAME TO "general_accounts_account_type_enum"`);
        await queryRunner.query(`DROP TABLE "customer_currency_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."customer_currency_accounts_accounttype_enum"`);
        await queryRunner.query(`DROP TABLE "chq_outward_entries"`);
        await queryRunner.query(`DROP TABLE "purchase_entries"`);
        await queryRunner.query(`DROP TABLE "selling_entries"`);
    }

}
