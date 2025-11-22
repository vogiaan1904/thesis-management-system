import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as XLSX from 'xlsx';
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
      // Step 1: Parse Excel file (supports both .xls and .xlsx)
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error('No worksheet found in Excel file');
      }

      const worksheet = workbook.Sheets[sheetName];
      // Convert to array of arrays for easier processing
      const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(
        worksheet,
        { header: 1 },
      );

      // Find header row (contains "Student ID")
      let headerRowIndex = -1;
      let studentIdCol = -1;
      let fullNameCol = -1;
      let dobCol = -1;
      let classCol = -1;
      let creditsCol = -1;

      for (let i = 0; i < Math.min(20, rows.length); i++) {
        const row = rows[i];
        if (!row) continue;

        // Look for "Student ID" in the row
        const studentIdIndex = row.findIndex(
          (cell) =>
            cell &&
            String(cell).toLowerCase().includes('student id'),
        );

        if (studentIdIndex !== -1) {
          headerRowIndex = i;
          studentIdCol = studentIdIndex;

          // Find other columns based on header
          row.forEach((cell, idx) => {
            const cellStr = String(cell || '').toLowerCase();
            if (cellStr.includes('full name') || cellStr.includes('fullname')) {
              fullNameCol = idx;
            } else if (cellStr.includes('date of birth') || cellStr.includes('dob')) {
              dobCol = idx;
            } else if (cellStr === 'class') {
              classCol = idx;
            } else if (cellStr.includes('credit')) {
              creditsCol = idx;
            }
          });

          this.logger.log(
            `Found header at row ${i}: studentIdCol=${studentIdCol}, fullNameCol=${fullNameCol}, dobCol=${dobCol}, classCol=${classCol}, creditsCol=${creditsCol}`,
          );
          break;
        }
      }

      if (headerRowIndex === -1) {
        throw new Error(
          'Could not find header row with "Student ID" column in Excel file',
        );
      }

      // Build a Map for O(1) lookups: studentId -> EdusoftRecord
      const edusoftMap = new Map<string, EdusoftRecord>();

      // Process data rows (after header)
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const studentId = String(row[studentIdCol] || '').trim();
        // Skip rows without valid student ID (must be alphanumeric)
        if (!studentId || !/^[A-Za-z0-9]+$/.test(studentId)) continue;

        // Handle full name - may be split across columns due to merged cells
        let fullName = '';
        if (fullNameCol !== -1) {
          // Collect all name parts from fullNameCol to dobCol (or classCol)
          const endCol = dobCol !== -1 ? dobCol : classCol !== -1 ? classCol : row.length;
          for (let j = fullNameCol; j < endCol; j++) {
            if (row[j]) fullName += String(row[j]) + ' ';
          }
          fullName = fullName.trim();
        }

        const creditsValue = creditsCol !== -1 ? row[creditsCol] : null;

        edusoftMap.set(studentId, {
          studentId,
          fullName,
          dateOfBirth: dobCol !== -1 ? String(row[dobCol] || '') : '',
          studentClass: classCol !== -1 ? String(row[classCol] || '') : '',
          credits:
            creditsValue !== null && creditsValue !== undefined
              ? Number(creditsValue)
              : null,
        });
      }

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
