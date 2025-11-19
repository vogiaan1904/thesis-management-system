import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicType } from '@prisma/client';

export class CreateTopicDto {
  @ApiProperty({
    description: 'Topic code (Format: HK251-DCLV-010)',
    example: 'HK251-DCLV-010',
  })
  @IsString()
  @IsNotEmpty()
  topicCode: string;

  @ApiProperty({
    description: 'Semester',
    example: 'HK251',
  })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({
    description: 'Topic type',
    enum: TopicType,
    example: TopicType.DCLV,
  })
  @IsEnum(TopicType)
  @IsNotEmpty()
  topicType: TopicType;

  @ApiProperty({
    description: 'Title in Vietnamese',
    example: 'Hệ thống quản lý đăng ký đề tài',
  })
  @IsString()
  @IsNotEmpty()
  titleVn: string;

  @ApiPropertyOptional({
    description: 'Title in English',
    example: 'Thesis Registration Management System',
  })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiProperty({
    description: 'Topic description',
    example: 'Build a web-based system for managing thesis registration',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Phase 1 requirements',
    example: 'Complete proposal document',
  })
  @IsOptional()
  @IsString()
  phase1Requirements?: string;

  @ApiPropertyOptional({
    description: 'Phase 2 requirements',
    example: 'Implement and test the system',
  })
  @IsOptional()
  @IsString()
  phase2Requirements?: string;

  @ApiProperty({
    description: 'Maximum number of students',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  maxStudents: number;

  @ApiProperty({
    description: 'Program types (CQ, CN, B2, SN, VLVH, TX)',
    example: ['CQ', 'CN'],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  programTypes: string[];

  @ApiPropertyOptional({
    description: 'Prerequisites',
    example: 'Completed at least 100 credits',
  })
  @IsOptional()
  @IsString()
  prerequisites?: string;

  @ApiPropertyOptional({
    description: 'References',
    example: [{ text: 'Reference 1', url: 'https://example.com' }],
    type: 'array',
  })
  @IsOptional()
  references?: Array<{ text: string; url?: string }>;

  @ApiProperty({
    description: 'Department',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  department: string;
}
