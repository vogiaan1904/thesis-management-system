import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigService } from './shared/services/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { TopicsModule } from './modules/topics/topics.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { VerificationModule } from './modules/verification/verification.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { join } from 'path';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { SharedModule } from './shared.module';

@Module({
  imports: [
    // Shared Module (Global Config Service)
    SharedModule,

    // Prisma Database Module (Global)
    PrismaModule,

    // Bull Queue for background jobs
    BullModule.forRootAsync({
      useFactory: (configService: AppConfigService) => ({
        redis: {
          host: configService.redisConfig.host,
          port: configService.redisConfig.port,
          password: configService.redisConfig.password || undefined,
        },
      }),
      inject: [AppConfigService],
    }),

    // Scheduler for cron jobs
    ScheduleModule.forRoot(),

    // Mailer for email notifications
    MailerModule.forRootAsync({
      useFactory: (configService: AppConfigService) => ({
        transport: {
          host: configService.emailConfig.host,
          port: configService.emailConfig.port,
          secure: false,
          auth: {
            user: configService.emailConfig.user,
            pass: configService.emailConfig.password,
          },
        },
        defaults: {
          from: configService.emailConfig.from,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [AppConfigService],
    }),

    // Feature modules
    AuthModule,
    TopicsModule,
    RegistrationsModule,
    VerificationModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
