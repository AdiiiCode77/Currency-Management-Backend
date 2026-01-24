import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1769283938643 implements MigrationInterface {
    name = 'Chat1769283938643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_payments" ADD "transaction_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin_payments" ADD CONSTRAINT "UQ_5ed8251f182ce218bea5160186b" UNIQUE ("transaction_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_payments" DROP CONSTRAINT "UQ_5ed8251f182ce218bea5160186b"`);
        await queryRunner.query(`ALTER TABLE "admin_payments" DROP COLUMN "transaction_id"`);
    }

}
