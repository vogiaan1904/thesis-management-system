import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewDecision {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class ReviewApplicationDto {
  @ApiProperty({
    description: 'Registration ID to review',
    example: 'uuid-of-registration',
  })
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @ApiProperty({
    description: 'Review decision',
    enum: ReviewDecision,
  })
  @IsEnum(ReviewDecision)
  @IsNotEmpty()
  decision: ReviewDecision;

  @ApiPropertyOptional({
    description: 'Instructor comment',
    example: 'Good application with strong background',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
