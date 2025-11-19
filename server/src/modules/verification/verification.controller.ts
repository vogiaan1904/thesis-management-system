import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VerificationService } from './verification.service';
import { UploadVerificationDto } from './dto/upload-verification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('verification')
@Controller('verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DEPARTMENT, UserRole.ADMIN)
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload Excel for verification (Department/Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        semester: {
          type: 'string',
          example: 'HK251',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Verification started',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          !file.originalname.match(/\.(xlsx|xls)$/)
        ) {
          return cb(new BadRequestException('Only Excel files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadVerification(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadVerificationDto,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.verificationService.uploadAndVerify(
      file.path,
      file.filename,
      userId,
      uploadDto,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get verification history' })
  @ApiResponse({
    status: 200,
    description: 'Verification history retrieved successfully',
  })
  getHistory() {
    return this.verificationService.getHistory();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest verification results' })
  @ApiResponse({
    status: 200,
    description: 'Latest verification retrieved successfully',
  })
  getLatest() {
    return this.verificationService.getLatest();
  }

  @Get(':batchId')
  @ApiOperation({ summary: 'Get verification batch by ID' })
  @ApiResponse({
    status: 200,
    description: 'Verification batch retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification batch not found',
  })
  getBatch(@Param('batchId') batchId: string) {
    return this.verificationService.getBatch(batchId);
  }

  @Post('process/:batchId')
  @ApiOperation({ summary: 'Re-process verification batch' })
  @ApiResponse({
    status: 200,
    description: 'Verification restarted',
  })
  @ApiResponse({
    status: 404,
    description: 'Verification batch not found',
  })
  reprocessBatch(@Param('batchId') batchId: string) {
    return this.verificationService.reprocessBatch(batchId);
  }
}
