import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RegistrationFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: RegistrationStatus,
  })
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;
}
