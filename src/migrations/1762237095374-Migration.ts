import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1762237095374 implements MigrationInterface {
    name = 'Migration1762237095374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chq_inward_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entryDate" date NOT NULL, "chqDate" date NOT NULL, "postingDate" date NOT NULL, "amount" numeric NOT NULL, "chqNumber" character varying NOT NULL, "adminId" character varying NOT NULL, "fromAccountId" uuid, "toAccountId" uuid, "chqBankRefId" uuid, CONSTRAINT "PK_842ddd73660eb14596e1ccbb10c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" ADD CONSTRAINT "FK_0975602c5d25d2f312614212e0d" FOREIGN KEY ("fromAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" ADD CONSTRAINT "FK_c8abba44ad818cea8a5bc6324e0" FOREIGN KEY ("toAccountId") REFERENCES "customer_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" ADD CONSTRAINT "FK_1cb70623de857c14d24570da3bc" FOREIGN KEY ("chqBankRefId") REFERENCES "chq_ref_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" DROP CONSTRAINT "FK_1cb70623de857c14d24570da3bc"`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" DROP CONSTRAINT "FK_c8abba44ad818cea8a5bc6324e0"`);
        await queryRunner.query(`ALTER TABLE "chq_inward_entries" DROP CONSTRAINT "FK_0975602c5d25d2f312614212e0d"`);
        await queryRunner.query(`DROP TABLE "chq_inward_entries"`);
    }

}
