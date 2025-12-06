import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
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

@Module({
  imports: [
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
    CurrencyModule,
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
    MailerModule.forRoot({
      transport: {
        service: process.env.MAIL_SERVICE,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: 'Nest Starter',
      },
      template: {
        dir: join(__dirname, '..', '..', 'src', 'shared', 'templates', 'mail'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
