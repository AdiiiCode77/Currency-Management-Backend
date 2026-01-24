import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { LoggerModule } from './modules/logger/logger.module';
import { UserModule } from './modules/users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './modules/account/account.module';
import { JournalModule } from './modules/journal/journal.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SalePurchaseModule } from './modules/sale-purchase/entry.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisModule } from './shared/modules/redis/redis.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,  // e.g., your Redis hostname
      port: +process.env.REDIS_PORT, // e.g., 6379
      password: process.env.REDIS_PASSWORD, // optional
      ttl: 600, // seconds
      db: 0,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    OtpModule,
    UserModule,
    AccountsModule,
    JournalModule,
    DashboardModule,
    SalePurchaseModule,
    ReportsModule,
    CurrencyModule,
    SuperAdminModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    // FCMModule,
    // NotificationModule,
    PrometheusModule.register({
      path: '/metrics',
    }),
    LoggerModule,
    RedisModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
