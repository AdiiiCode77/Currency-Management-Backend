import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/src/modules/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
});
