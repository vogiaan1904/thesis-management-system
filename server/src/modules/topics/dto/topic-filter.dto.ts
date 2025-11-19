import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TopicType, TopicStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class TopicFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by semester',
    example: 'HK251',
  })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiPropertyOptional({
    description: 'Filter by topic type',
    enum: TopicType,
  })
  @IsOptional()
  @IsEnum(TopicType)
  topicType?: TopicType;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: TopicStatus,
  })
  @IsOptional()
  @IsEnum(TopicStatus)
  status?: TopicStatus;

  @ApiPropertyOptional({
    description: 'Filter by department',
    example: 'Computer Science',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Search by keyword (title, description)',
    example: 'web application',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by program type',
    example: 'CQ',
  })
  @IsOptional()
  @IsString()
  programType?: string;
}
