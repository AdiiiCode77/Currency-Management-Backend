import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1765010944544 implements MigrationInterface {
    name = 'Chat1765010944544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP CONSTRAINT "FK_bcbfc38fd4cf188b03a4d77aedc"`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP CONSTRAINT "FK_6680415af33de154fef9e0f18aa"`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ALTER COLUMN "customer_account_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD CONSTRAINT "FK_6680415af33de154fef9e0f18aa" FOREIGN KEY ("customer_account_id") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP CONSTRAINT "FK_6680415af33de154fef9e0f18aa"`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ALTER COLUMN "customer_account_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD CONSTRAINT "FK_6680415af33de154fef9e0f18aa" FOREIGN KEY ("customer_account_id") REFERENCES "currency_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD CONSTRAINT "FK_bcbfc38fd4cf188b03a4d77aedc" FOREIGN KEY ("currency_dr_id") REFERENCES "currency_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
