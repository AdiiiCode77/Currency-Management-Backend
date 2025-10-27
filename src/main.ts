import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalSanitizerPipe } from './shared/pipes/global-sanitizer.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './modules/logger/logger.service';
import express from 'express';

async function bootstrap() {
  const loggerService: LoggerService = new LoggerService();
  const app = await NestFactory.create(AppModule, {
    logger: loggerService.logger,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
    new GlobalSanitizerPipe(),
  );
  const configService = app.get(ConfigService);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Admin Panel')
    .setDescription('API Documentation for Admin Panel')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-docs', app, documentFactory);

  app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }));
  app.use(express.urlencoded({ extended: false }));

  await app.listen(configService.get('PORT'));
}
bootstrap();
