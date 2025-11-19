import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VerificationProcessor } from './verification.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    PrismaModule,
    RegistrationsModule,
    BullModule.registerQueue({
      name: 'verification',
    }),
  ],
  controllers: [VerificationController],
  providers: [VerificationService, VerificationProcessor],
  exports: [VerificationService],
})
export class VerificationModule {}
