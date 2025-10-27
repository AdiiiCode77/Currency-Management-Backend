import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1761472249322 implements MigrationInterface {
    name = 'Migration1761472249322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "phone" character varying, "password" character varying, "name" character varying, "email_is_verified" boolean NOT NULL DEFAULT false, "block_status" boolean NOT NULL DEFAULT false, "last_login" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `);
        await queryRunner.query(`CREATE TABLE "user_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_43a206b10365efbb4c3189a049b" UNIQUE ("name"), CONSTRAINT "PK_3f05efd7b52a7eca1f6b6f75e45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_type_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d0d6809d22d5d9fefaf598a9c0" ON "user_profiles" ("user_id", "user_type_id") `);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateOfBirth" integer NOT NULL DEFAULT '0', "user_profile_id" uuid NOT NULL, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" text NOT NULL, "user_profile_id" uuid NOT NULL, CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otp_entity" ("id" uuid NOT NULL, "code" text NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_af69f5d9d41ea2100820431b72e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "otp_signup_entity" ("id" uuid NOT NULL, "code" text NOT NULL, "email" text, CONSTRAINT "PK_9bc85b7342136612c1e508062ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "contact" character varying NOT NULL, "email" character varying NOT NULL, "address" character varying NOT NULL, "old_account_number" character varying NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_814e5a9128d2a2fffbddffc0a27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."journal_entries_paymenttype_enum" AS ENUM('JV Payment', 'Cust-to-Cust Online', 'OK-JV')`);
        await queryRunner.query(`CREATE TABLE "journal_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "paymentType" "public"."journal_entries_paymenttype_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "description" text, "chqNo" character varying, "admin_id" uuid NOT NULL, "crAccountId" uuid, "drAccountId" uuid, CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cash_received_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "amount" numeric(10,2) NOT NULL, "description" character varying(255) NOT NULL, "admin_id" uuid NOT NULL, "crAccountId" uuid, "drAccountId" uuid, CONSTRAINT "PK_6398b91cb7666ec4bad956e084f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cash_payment_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "amount" numeric(10,2) NOT NULL, "description" character varying(255) NOT NULL, "admin_id" uuid NOT NULL, "crAccountId" uuid, "drAccountId" uuid, CONSTRAINT "PK_7bcaaea99f19f7921443bcb463b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_receiver_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "amount" numeric(10,2) NOT NULL, "branchCode" character varying(255) NOT NULL, "admin_id" uuid NOT NULL, "crAccountId" uuid, "drAccountId" uuid, CONSTRAINT "PK_83ac6a410848fe62baac0c64f0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_payment_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "amount" numeric(12,2) NOT NULL, "description" text, "chqNo" character varying(50), "admin_id" uuid NOT NULL, "crAccountId" uuid, "drAccountId" uuid, CONSTRAINT "PK_bd1021fe1d7659bb427b228512b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."general_accounts_account_type_enum" AS ENUM('Asset', 'Capital', 'Cash', 'Income', 'Liability', 'Employee', 'Personal Account', 'Partnership Account', 'Property Account', 'Stock Account', 'Others')`);
        await queryRunner.query(`CREATE TABLE "general_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "account_type" "public"."general_accounts_account_type_enum" NOT NULL, "name" character varying NOT NULL, "account_information" character varying NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_32d8c5e51282b9179f31387be35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "father_name" character varying NOT NULL, "cnic" character varying NOT NULL, "contact" character varying NOT NULL, "address" character varying NOT NULL, "monthly_salary" numeric(10,2) NOT NULL, "joining_date" date NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "UQ_071c757e9b94da16f98459a395d" UNIQUE ("cnic"), CONSTRAINT "PK_c43f1a4433ff1c78db0f5950b21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "currency_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "admin_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1b9178e238ca9c0a7ecff4f763f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "currency_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "currencyAccountName" character varying NOT NULL, "salePurchaseCode" character varying NOT NULL, "formulaType" character varying NOT NULL, "admin_id" uuid NOT NULL, "currencyId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_44d8cedfcbbf5439ee46da6f33f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bank_name" character varying NOT NULL, "account_holder" character varying NOT NULL, "account_number" character varying NOT NULL, "contact" character varying NOT NULL, "address" character varying NOT NULL, "old_account_id" character varying NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "expenses-account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "admin_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eda8316413d0fb85f4215d84d94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chq_ref_bank" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "accountNumber" character varying NOT NULL, "admin_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7a3028c773ba06214c0b05f0167" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_cec675ea0e63fba012f67df0cc0" FOREIGN KEY ("user_type_id") REFERENCES "user_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_ed9e1ae2addecf0fe138139495b" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ADD CONSTRAINT "FK_2604e40bd491024d2d1382e2d2c" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_entries" ADD CONSTRAINT "FK_c51979d02b9caaa57e4a772a676" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ADD CONSTRAINT "FK_4f14678a87d8d24129628bd1fe9" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" ADD CONSTRAINT "FK_0bbc9a59598f020fdb9e774eb69" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ADD CONSTRAINT "FK_ea136cd030da26098b2ce3788b8" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" ADD CONSTRAINT "FK_063c90900341cf4a8cdc433f7eb" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ADD CONSTRAINT "FK_b55e1ede18d289ece043a95cb3e" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" ADD CONSTRAINT "FK_ef77403b48f4521ae5de090af95" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" ADD CONSTRAINT "FK_b3aae41e6e17d56c464a4666f74" FOREIGN KEY ("crAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" ADD CONSTRAINT "FK_43b30bddb9ca7e5d593c5591fdb" FOREIGN KEY ("drAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "currency_account" ADD CONSTRAINT "FK_af8be9f31a564714a95d9ca94cc" FOREIGN KEY ("currencyId") REFERENCES "currency_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "currency_account" DROP CONSTRAINT "FK_af8be9f31a564714a95d9ca94cc"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" DROP CONSTRAINT "FK_43b30bddb9ca7e5d593c5591fdb"`);
        await queryRunner.query(`ALTER TABLE "bank_payment_entries" DROP CONSTRAINT "FK_b3aae41e6e17d56c464a4666f74"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" DROP CONSTRAINT "FK_ef77403b48f4521ae5de090af95"`);
        await queryRunner.query(`ALTER TABLE "bank_receiver_entries" DROP CONSTRAINT "FK_b55e1ede18d289ece043a95cb3e"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" DROP CONSTRAINT "FK_063c90900341cf4a8cdc433f7eb"`);
        await queryRunner.query(`ALTER TABLE "cash_payment_entries" DROP CONSTRAINT "FK_ea136cd030da26098b2ce3788b8"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" DROP CONSTRAINT "FK_0bbc9a59598f020fdb9e774eb69"`);
        await queryRunner.query(`ALTER TABLE "cash_received_entries" DROP CONSTRAINT "FK_4f14678a87d8d24129628bd1fe9"`);
        await queryRunner.query(`ALTER TABLE "journal_entries" DROP CONSTRAINT "FK_c51979d02b9caaa57e4a772a676"`);
        await queryRunner.query(`ALTER TABLE "journal_entries" DROP CONSTRAINT "FK_2604e40bd491024d2d1382e2d2c"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_ed9e1ae2addecf0fe138139495b"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_cec675ea0e63fba012f67df0cc0"`);
        await queryRunner.query(`DROP TABLE "chq_ref_bank"`);
        await queryRunner.query(`DROP TABLE "expenses-account"`);
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
        await queryRunner.query(`DROP TABLE "currency_account"`);
        await queryRunner.query(`DROP TABLE "currency_user"`);
        await queryRunner.query(`DROP TABLE "employee_accounts"`);
        await queryRunner.query(`DROP TABLE "general_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."general_accounts_account_type_enum"`);
        await queryRunner.query(`DROP TABLE "bank_payment_entries"`);
        await queryRunner.query(`DROP TABLE "bank_receiver_entries"`);
        await queryRunner.query(`DROP TABLE "cash_payment_entries"`);
        await queryRunner.query(`DROP TABLE "cash_received_entries"`);
        await queryRunner.query(`DROP TABLE "journal_entries"`);
        await queryRunner.query(`DROP TYPE "public"."journal_entries_paymenttype_enum"`);
        await queryRunner.query(`DROP TABLE "customer_accounts"`);
        await queryRunner.query(`DROP TABLE "otp_signup_entity"`);
        await queryRunner.query(`DROP TABLE "otp_entity"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0d6809d22d5d9fefaf598a9c0"`);
        await queryRunner.query(`DROP TABLE "user_profiles"`);
        await queryRunner.query(`DROP TABLE "user_types"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
