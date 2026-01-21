import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1769010299955 implements MigrationInterface {
    name = 'Chat1769010299955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "currency_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "currency_id" uuid NOT NULL, "admin_id" uuid NOT NULL, "balance_pkr" numeric(30,2) NOT NULL DEFAULT '0', "balance_currency" numeric(30,2) NOT NULL DEFAULT '0', "avg_rate" numeric(30,6) NOT NULL DEFAULT '0', "total_sales" integer NOT NULL DEFAULT '0', "total_purchases" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9814d2482e8504b3135147ba79f" UNIQUE ("currency_id", "admin_id"), CONSTRAINT "PK_2e893ae89f6d785b720f70d9eed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2db58ff866d52317270858bd6b" ON "currency_balances" ("currency_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a5e6488a0594ddba8e2ef2212" ON "currency_balances" ("admin_id") `);
        await queryRunner.query(`ALTER TABLE "currency_balances" ADD CONSTRAINT "FK_2db58ff866d52317270858bd6bf" FOREIGN KEY ("currency_id") REFERENCES "currency_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "currency_balances" DROP CONSTRAINT "FK_2db58ff866d52317270858bd6bf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a5e6488a0594ddba8e2ef2212"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2db58ff866d52317270858bd6b"`);
        await queryRunner.query(`DROP TABLE "currency_balances"`);
    }

}
