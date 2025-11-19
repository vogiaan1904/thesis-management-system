import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async notifyInstructor(registration: any) {
    try {
      await this.mailerService.sendMail({
        to: registration.topic.instructor.email,
        subject: 'New Thesis Application',
        html: `
          <h2>New Thesis Application</h2>
          <p>Dear ${registration.topic.instructor.fullName},</p>
          <p>You have received a new application for your thesis topic:</p>
          <ul>
            <li><strong>Topic:</strong> ${registration.topic.topicCode} - ${registration.topic.titleVn}</li>
            <li><strong>Student:</strong> ${registration.student.fullName} (${registration.student.userId})</li>
            <li><strong>Program:</strong> ${registration.student.program || 'N/A'}</li>
            <li><strong>Credits Claimed:</strong> ${registration.creditsClaimed || 'N/A'}</li>
          </ul>
          ${registration.motivationLetter ? `<p><strong>Motivation Letter:</strong><br/>${registration.motivationLetter}</p>` : ''}
          <p>Please log in to the system to review this application.</p>
          <br/>
          <p>Best regards,<br/>Thesis Management System</p>
        `,
      });
      this.logger.log(`Notification sent to instructor ${registration.topic.instructor.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to instructor: ${error.message}`);
    }
  }

  async notifyStudent(registration: any) {
    try {
      const statusMessage = this.getStatusMessage(registration.status);

      await this.mailerService.sendMail({
        to: registration.student.email,
        subject: `Thesis Application Status Update`,
        html: `
          <h2>Application Status Update</h2>
          <p>Dear ${registration.student.fullName},</p>
          <p>Your application status has been updated:</p>
          <ul>
            <li><strong>Topic:</strong> ${registration.topic.topicCode} - ${registration.topic.titleVn}</li>
            <li><strong>Status:</strong> ${statusMessage}</li>
            ${registration.instructorComment ? `<li><strong>Instructor Comment:</strong> ${registration.instructorComment}</li>` : ''}
          </ul>
          <p>Please log in to the system for more details.</p>
          <br/>
          <p>Best regards,<br/>Thesis Management System</p>
        `,
      });
      this.logger.log(`Notification sent to student ${registration.student.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to student: ${error.message}`);
    }
  }

  async notifyInvalidRegistration(registration: any) {
    try {
      const statusMessage = this.getStatusMessage(registration.status);

      await this.mailerService.sendMail({
        to: registration.student.email,
        subject: 'Thesis Registration Verification Failed',
        html: `
          <h2>Registration Verification Update</h2>
          <p>Dear ${registration.student.fullName},</p>
          <p>Your thesis registration verification has encountered an issue:</p>
          <ul>
            <li><strong>Topic:</strong> ${registration.topic.topicCode} - ${registration.topic.titleVn}</li>
            <li><strong>Status:</strong> ${statusMessage}</li>
            ${registration.creditsClaimed ? `<li><strong>Credits Claimed:</strong> ${registration.creditsClaimed}</li>` : ''}
            ${registration.creditsVerified !== null ? `<li><strong>Credits Verified:</strong> ${registration.creditsVerified}</li>` : ''}
          </ul>
          <p>Please contact the department office for assistance.</p>
          <br/>
          <p>Best regards,<br/>Thesis Management System</p>
        `,
      });
      this.logger.log(`Invalid registration notification sent to ${registration.student.email}`);
    } catch (error) {
      this.logger.error(`Failed to send invalid registration email: ${error.message}`);
    }
  }

  async notifyVerificationComplete(batchId: string, results: any) {
    try {
      // This would typically send to department staff
      const departmentEmail = this.configService.get('MAIL_USER');

      await this.mailerService.sendMail({
        to: departmentEmail,
        subject: 'Verification Batch Complete',
        html: `
          <h2>Verification Batch Complete</h2>
          <p>The verification batch ${batchId} has been processed:</p>
          <ul>
            <li><strong>Total Registrations:</strong> ${results.total}</li>
            <li><strong>Verified:</strong> ${results.verified}</li>
            <li><strong>Invalid Credits:</strong> ${results.invalidCredits}</li>
            <li><strong>Not Enrolled:</strong> ${results.notEnrolled}</li>
          </ul>
          <p>Please log in to the system to review the results.</p>
          <br/>
          <p>Best regards,<br/>Thesis Management System</p>
        `,
      });
      this.logger.log(`Verification complete notification sent`);
    } catch (error) {
      this.logger.error(`Failed to send verification complete email: ${error.message}`);
    }
  }

  private getStatusMessage(status: string): string {
    const statusMap = {
      PENDING_INSTRUCTOR_REVIEW: 'Pending Instructor Review',
      INSTRUCTOR_ACCEPTED: 'Accepted by Instructor',
      INSTRUCTOR_DENIED: 'Denied by Instructor',
      VERIFIED: 'Verified by Department',
      INVALID_CREDITS: 'Invalid Credits',
      NOT_ENROLLED_EDUSOFT: 'Not Enrolled in EDUSoft',
      DEPARTMENT_REVOKED: 'Revoked by Department',
    };
    return statusMap[status] || status;
  }
}
