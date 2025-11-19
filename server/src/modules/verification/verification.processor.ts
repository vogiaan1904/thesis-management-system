import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';
import { RegistrationsGateway } from '../registrations/registrations.gateway';

interface VerificationJobData {
  batchId: string;
  filePath: string;
}

interface EdusoftRecord {
  studentId: string;
  studentName: string;
  enrolledInThesis: boolean;
  actualCredits: number;
  englishPassed: boolean;
}

@Processor('verification')
export class VerificationProcessor {
  private readonly logger = new Logger(VerificationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private registrationsGateway: RegistrationsGateway,
  ) {}

  @Process('verify-excel')
  async handleVerification(job: Job<VerificationJobData>) {
    const { batchId, filePath } = job.data;

    this.logger.log(`Starting verification for batch ${batchId}`);

    try {
      // Step 1: Parse Excel file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }

      const edusoftData: EdusoftRecord[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        edusoftData.push({
          studentId: String(row.getCell(1).value || ''),
          studentName: String(row.getCell(2).value || ''),
          enrolledInThesis: row.getCell(3).value === 'Yes' || row.getCell(3).value === 'TRUE',
          actualCredits: Number(row.getCell(4).value) || 0,
          englishPassed: row.getCell(5).value === 'Yes' || row.getCell(5).value === 'TRUE',
        });
      });

      this.logger.log(`Parsed ${edusoftData.length} records from Excel`);

      // Step 2: Get all INSTRUCTOR_ACCEPTED registrations
      const registrations = await this.prisma.registration.findMany({
        where: {
          status: RegistrationStatus.INSTRUCTOR_ACCEPTED,
        },
        include: {
          student: true,
          topic: true,
        },
      });

      this.logger.log(`Found ${registrations.length} registrations to verify`);

      const results = {
        total: registrations.length,
        verified: 0,
        invalidCredits: 0,
        notEnrolled: 0,
      };

      // Step 3: Verify each registration
      for (const registration of registrations) {
        const edusoftRecord = edusoftData.find(
          (e) => e.studentId === registration.student.userId,
        );

        let newStatus: RegistrationStatus;
        let creditsVerified: number | null = null;

        if (!edusoftRecord || !edusoftRecord.enrolledInThesis) {
          newStatus = RegistrationStatus.NOT_ENROLLED_EDUSOFT;
          results.notEnrolled++;
        } else if (
          registration.creditsClaimed &&
          edusoftRecord.actualCredits < registration.creditsClaimed
        ) {
          newStatus = RegistrationStatus.INVALID_CREDITS;
          creditsVerified = edusoftRecord.actualCredits;
          results.invalidCredits++;
        } else {
          newStatus = RegistrationStatus.VERIFIED;
          creditsVerified = edusoftRecord.actualCredits;
          results.verified++;
        }

        // Update registration with new status
        const updated = await this.prisma.registration.update({
          where: { id: registration.id },
          data: {
            status: newStatus,
            creditsVerified: creditsVerified,
            verifiedAt: new Date(),
          },
          include: {
            student: true,
            topic: true,
          },
        });

        // Send notification
        this.registrationsGateway.notifyVerificationComplete(updated);
      }

      // Step 4: Update batch record
      await this.prisma.verificationBatch.update({
        where: { id: batchId },
        data: {
          results: results,
        },
      });

      this.logger.log(`Verification complete for batch ${batchId}`, results);

      return results;
    } catch (error) {
      this.logger.error(`Verification failed for batch ${batchId}`, error);

      // Update batch with error
      await this.prisma.verificationBatch.update({
        where: { id: batchId },
        data: {
          errors: error.message,
        },
      });

      throw error;
    }
  }
}
