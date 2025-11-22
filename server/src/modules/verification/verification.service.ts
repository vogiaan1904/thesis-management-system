import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadVerificationDto } from './dto/upload-verification.dto';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('verification') private verificationQueue: Queue,
  ) {}

  async uploadAndVerify(
    filePath: string,
    fileName: string,
    uploadedBy: string,
    uploadDto: UploadVerificationDto,
  ) {
    // Create verification batch record
    const batch = await this.prisma.verificationBatch.create({
      data: {
        semester: uploadDto.semester,
        fileName: fileName,
        filePath: filePath, // Store full path for reprocessing
        uploadedBy: uploadedBy,
        results: { total: 0, verified: 0, invalidCredits: 0, notEnrolled: 0 },
      },
    });

    // Add job to queue for processing
    await this.verificationQueue.add('verify-excel', {
      batchId: batch.id,
      filePath: filePath,
    });

    return {
      batchId: batch.id,
      message: 'Verification started. You will be notified when complete.',
    };
  }

  async getHistory() {
    return this.prisma.verificationBatch.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLatest() {
    return this.prisma.verificationBatch.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBatch(batchId: string) {
    const batch = await this.prisma.verificationBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Verification batch not found');
    }

    return batch;
  }

  async reprocessBatch(batchId: string) {
    const batch = await this.prisma.verificationBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException('Verification batch not found');
    }

    // Re-add job to queue with the stored file path
    await this.verificationQueue.add('verify-excel', {
      batchId: batch.id,
      filePath: batch.filePath,
    });

    return {
      message: 'Verification restarted for batch ' + batchId,
    };
  }
}
