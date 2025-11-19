import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadVerificationDto {
  @ApiProperty({
    description: 'Semester',
    example: 'HK251',
  })
  @IsString()
  @IsNotEmpty()
  semester: string;
}
