import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1761234407814 implements MigrationInterface {
    name = 'Migration1761234407814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."general_accounts_account_type_enum" AS ENUM('Asset', 'Capital', 'Cash', 'Income', 'Liability', 'Employee', 'Personal Account', 'Partnership Account', 'Property Account', 'Stock Account', 'Others')`);
        await queryRunner.query(`CREATE TABLE "general_accounts" ("id" SERIAL NOT NULL, "account_type" "public"."general_accounts_account_type_enum" NOT NULL, "name" character varying NOT NULL, "account_information" character varying NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_32d8c5e51282b9179f31387be35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_accounts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "father_name" character varying NOT NULL, "cnic" character varying NOT NULL, "contact" character varying NOT NULL, "address" character varying NOT NULL, "monthly_salary" numeric(10,2) NOT NULL, "joining_date" date NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "UQ_071c757e9b94da16f98459a395d" UNIQUE ("cnic"), CONSTRAINT "PK_c43f1a4433ff1c78db0f5950b21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer_accounts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "contact" character varying NOT NULL, "email" character varying NOT NULL, "address" character varying NOT NULL, "old_account_number" character varying NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_814e5a9128d2a2fffbddffc0a27" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" SERIAL NOT NULL, "bank_name" character varying NOT NULL, "account_holder" character varying NOT NULL, "account_number" character varying NOT NULL, "contact" character varying NOT NULL, "address" character varying NOT NULL, "old_account_id" character varying NOT NULL, "admin_id" uuid NOT NULL, CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
        await queryRunner.query(`DROP TABLE "customer_accounts"`);
        await queryRunner.query(`DROP TABLE "employee_accounts"`);
        await queryRunner.query(`DROP TABLE "general_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."general_accounts_account_type_enum"`);
    }

}
