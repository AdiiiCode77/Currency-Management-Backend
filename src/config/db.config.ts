import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// db.config.ts
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  // migrations: [/*...*/],
  // synchronize: true,
  // logging: "all",
};
