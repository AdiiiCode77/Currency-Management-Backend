import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAccountBalanceAndLedgerTables1735360800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create account_balances table
    await queryRunner.createTable(
      new Table({
        name: 'account_balances',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'adminId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accountId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accountType',
            type: 'enum',
            enum: ['CURRENCY', 'CUSTOMER', 'BANK', 'GENERAL'],
            isNullable: false,
          },
          {
            name: 'accountName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accountMetadata',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'totalDebit',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'totalCredit',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'balanceType',
            type: 'enum',
            enum: ['DEBIT', 'CREDIT'],
            isNullable: true,
          },
          {
            name: 'entryCount',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'lastEntryDate',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    // Add indexes for account_balances
    await queryRunner.createIndex(
      'account_balances',
      new TableIndex({
        name: 'IDX_ACCOUNT_BALANCES_ADMIN_ACCOUNT',
        columnNames: ['adminId', 'accountId', 'accountType'],
      }),
    );

    await queryRunner.createIndex(
      'account_balances',
      new TableIndex({
        name: 'IDX_ACCOUNT_BALANCES_ADMIN',
        columnNames: ['adminId'],
      }),
    );

    // Create account_ledgers table
    await queryRunner.createTable(
      new Table({
        name: 'account_ledgers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'adminId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accountId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'accountType',
            type: 'enum',
            enum: ['CURRENCY', 'CUSTOMER', 'BANK', 'GENERAL'],
            isNullable: false,
          },
          {
            name: 'accountName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'entryType',
            type: 'enum',
            enum: ['JOURNAL', 'BANK_PAYMENT', 'BANK_RECEIPT', 'CASH_PAYMENT', 'CASH_RECEIPT', 'SELLING', 'PURCHASE'],
            isNullable: false,
          },
          {
            name: 'narration',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'debit',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'credit',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'reference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'cumulativeDebit',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'cumulativeCredit',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'sourceEntryId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sourceEntryType',
            type: 'enum',
            enum: ['JOURNAL', 'BANK_PAYMENT', 'BANK_RECEIVER', 'CASH_PAYMENT', 'CASH_RECEIVED'],
            isNullable: true,
          },
        ],
      }),
    );

    // Add indexes for account_ledgers
    await queryRunner.createIndex(
      'account_ledgers',
      new TableIndex({
        name: 'IDX_ACCOUNT_LEDGERS_ADMIN_ACCOUNT_DATE',
        columnNames: ['adminId', 'accountId', 'accountType', 'date'],
      }),
    );

    await queryRunner.createIndex(
      'account_ledgers',
      new TableIndex({
        name: 'IDX_ACCOUNT_LEDGERS_ADMIN_ACCOUNT',
        columnNames: ['adminId', 'accountId'],
      }),
    );

    await queryRunner.createIndex(
      'account_ledgers',
      new TableIndex({
        name: 'IDX_ACCOUNT_LEDGERS_ADMIN_DATE',
        columnNames: ['adminId', 'date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('account_ledgers', true);
    await queryRunner.dropTable('account_balances', true);
  }
}
