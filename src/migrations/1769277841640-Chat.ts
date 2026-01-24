import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1769277841640 implements MigrationInterface {
    name = 'Chat1769277841640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "super_admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9719b4228e14e28a8253cb108f2" UNIQUE ("email"), CONSTRAINT "PK_466d3b6370f0695b22d664e9dff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."admin_payments_status_enum" AS ENUM('pending', 'paid', 'overdue')`);
        await queryRunner.query(`CREATE TABLE "admin_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "admin_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "status" "public"."admin_payments_status_enum" NOT NULL DEFAULT 'pending', "description" character varying, "due_date" date, "paid_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40e545e5ee473df69587c906083" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin_payments"`);
        await queryRunner.query(`DROP TYPE "public"."admin_payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "super_admins"`);
    }

}
