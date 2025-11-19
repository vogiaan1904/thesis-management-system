import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRegistrationDto {
  @ApiPropertyOptional({
    description: 'Number of credits claimed',
    example: 120,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  creditsClaimed?: number;

  @ApiPropertyOptional({
    description: 'URL of uploaded transcript',
    example: '/uploads/transcript.pdf',
  })
  @IsOptional()
  @IsString()
  transcriptUrl?: string;

  @ApiPropertyOptional({
    description: 'Motivation letter',
    example: 'I am interested in this topic because...',
  })
  @IsOptional()
  @IsString()
  motivationLetter?: string;
}
