import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from '@services/config.service';
import { AppModule } from './app.module';
import { LoggerService } from '@services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);
  const loggerService = app.get(LoggerService);

  app.useLogger(loggerService);

  // Global prefix
  app.setGlobalPrefix(configService.appConfig.apiPrefix);

  // CORS
  app.enableCors({
    origin: configService.appConfig.corsOrigin,
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Thesis Registration System API')
    .setDescription('API for managing thesis topic registration')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('topics', 'Topic management')
    .addTag('registrations', 'Registration management')
    .addTag('verification', 'Verification management')
    .addTag('reports', 'Reports and statistics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Start server
  const port = configService.appConfig.port;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api-docs`);
  console.log(`API Base URL: http://localhost:${port}/api`);
}

bootstrap();
