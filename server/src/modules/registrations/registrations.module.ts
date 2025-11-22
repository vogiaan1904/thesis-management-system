import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsGateway } from './registrations.gateway';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationsGateway],
  exports: [RegistrationsService, RegistrationsGateway],
})
export class RegistrationsModule {}
