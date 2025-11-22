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
  fullName: string;
  dateOfBirth: string;
  studentClass: string;
  credits: number | null;
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

      // Build a Map for O(1) lookups: studentId -> EdusoftRecord
      const edusoftMap = new Map<string, EdusoftRecord>();
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        // EDUSoft Excel format:
        // Column 1: No. (row number - skip)
        // Column 2: Student ID (match key)
        // Column 3: Full name
        // Column 4: Date of birth
        // Column 5: Class
        // Column 6: Credits (optional)
        const studentId = String(row.getCell(2).value || '').trim();
        if (studentId) {
          const creditsValue = row.getCell(6).value;
          edusoftMap.set(studentId, {
            studentId,
            fullName: String(row.getCell(3).value || ''),
            dateOfBirth: String(row.getCell(4).value || ''),
            studentClass: String(row.getCell(5).value || ''),
            credits:
              creditsValue !== null && creditsValue !== undefined
                ? Number(creditsValue)
                : null,
          });
        }
      });

      this.logger.log(`Parsed ${edusoftMap.size} records from Excel`);

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
        // O(1) lookup using Map
        const edusoftRecord = edusoftMap.get(registration.student.userId);

        let newStatus: RegistrationStatus;
        let creditsVerified: number | null = null;

        if (!edusoftRecord) {
          // Student not found in EDUSoft Excel → not enrolled in thesis course
          newStatus = RegistrationStatus.NOT_ENROLLED_EDUSOFT;
          results.notEnrolled++;
        } else if (
          edusoftRecord.credits !== null &&
          registration.creditsClaimed &&
          edusoftRecord.credits < registration.creditsClaimed
        ) {
          // Credits validation (only if credits column exists in Excel)
          newStatus = RegistrationStatus.INVALID_CREDITS;
          creditsVerified = edusoftRecord.credits;
          results.invalidCredits++;
        } else {
          // Student found and passes all checks
          newStatus = RegistrationStatus.VERIFIED;
          creditsVerified = edusoftRecord.credits;
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
