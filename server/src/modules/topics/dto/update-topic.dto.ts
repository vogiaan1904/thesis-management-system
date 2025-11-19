import { PartialType } from '@nestjs/swagger';
import { CreateTopicDto } from './create-topic.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TopicStatus } from '@prisma/client';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  @ApiPropertyOptional({
    description: 'Topic status',
    enum: TopicStatus,
  })
  @IsOptional()
  @IsEnum(TopicStatus)
  status?: TopicStatus;
}
