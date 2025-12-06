import { MigrationInterface, QueryRunner } from "typeorm";

export class Chat1765017934823 implements MigrationInterface {
    name = 'Chat1765017934823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "selling_entries" ADD "sale_no" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase_entries" ADD "purchase_no" SERIAL NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_entries" DROP COLUMN "purchase_no"`);
        await queryRunner.query(`ALTER TABLE "selling_entries" DROP COLUMN "sale_no"`);
    }

}
