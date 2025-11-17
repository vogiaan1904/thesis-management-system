import {
  ThesisTopic,
  ThesisApplication,
  RegistrationStatus,
  EDUSoftStudent,
  ApplicationFormData,
} from '../types';
import {
  mockTopics,
  mockApplications,
  mockEDUSoftData,
} from './mockData';

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory state for demo purposes
let topics = [...mockTopics];
let applications = [...mockApplications];
let edusoftData = [...mockEDUSoftData];

// Topic APIs
export const topicService = {
  async getAll(): Promise<ThesisTopic[]> {
    await delay(300);
    return topics;
  },

  async getById(id: string): Promise<ThesisTopic | undefined> {
    await delay(200);
    return topics.find((t) => t.id === id);
  },

  async getByInstructor(instructorId: string): Promise<ThesisTopic[]> {
    await delay(300);
    return topics.filter((t) => t.instructorId === instructorId);
  },

  async updateSlots(topicId: string, delta: number): Promise<void> {
    await delay(200);
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      topic.availableSlots = Math.max(0, topic.availableSlots + delta);
      topic.updatedAt = new Date();
    }
  },
};

// Application APIs
export const applicationService = {
  async getAll(): Promise<ThesisApplication[]> {
    await delay(300);
    return applications;
  },

  async getByStudent(studentId: string): Promise<ThesisApplication[]> {
    await delay(300);
    return applications.filter((a) => a.studentId === studentId);
  },

  async getByInstructor(instructorId: string): Promise<ThesisApplication[]> {
    await delay(300);
    return applications.filter((a) => a.instructorId === instructorId);
  },

  async getByStatus(status: RegistrationStatus): Promise<ThesisApplication[]> {
    await delay(300);
    return applications.filter((a) => a.status === status);
  },

  async create(
    data: ApplicationFormData,
    studentInfo: {
      studentId: string;
      studentName: string;
      studentEmail: string;
    }
  ): Promise<ThesisApplication> {
    await delay(500);
    const topic = topics.find((t) => t.id === data.topicId);
    if (!topic) throw new Error('Topic not found');

    const newApplication: ThesisApplication = {
      id: `app-${Date.now()}`,
      studentId: studentInfo.studentId,
      studentName: studentInfo.studentName,
      studentEmail: studentInfo.studentEmail,
      topicId: data.topicId,
      topicTitle: topic.title,
      instructorId: topic.instructorId,
      instructorName: topic.instructorName,
      status: 'PENDING_INSTRUCTOR_REVIEW',
      selfReportedCredits: data.selfReportedCredits,
      motivationLetter: data.motivationLetter,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    applications.push(newApplication);
    topic.pendingApplications += 1;
    return newApplication;
  },

  async updateStatus(
    applicationId: string,
    status: RegistrationStatus,
    notes?: string
  ): Promise<ThesisApplication> {
    await delay(400);
    const app = applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const oldStatus = app.status;
    app.status = status;
    app.updatedAt = new Date();

    if (notes) {
      if (status.startsWith('INSTRUCTOR')) {
        app.instructorNotes = notes;
      } else {
        app.departmentNotes = notes;
      }
    }

    // Update topic slots based on status change
    const topic = topics.find((t) => t.id === app.topicId);
    if (topic) {
      if (oldStatus === 'PENDING_INSTRUCTOR_REVIEW') {
        topic.pendingApplications = Math.max(0, topic.pendingApplications - 1);
      }

      if (status === 'INSTRUCTOR_ACCEPTED' && oldStatus !== 'INSTRUCTOR_ACCEPTED') {
        topic.availableSlots = Math.max(0, topic.availableSlots - 1);
      } else if (oldStatus === 'INSTRUCTOR_ACCEPTED' && status !== 'INSTRUCTOR_ACCEPTED') {
        topic.availableSlots = Math.min(topic.totalSlots, topic.availableSlots + 1);
      }
    }

    return app;
  },
};

// Verification APIs
export const verificationService = {
  async uploadEDUSoftData(data: EDUSoftStudent[]): Promise<void> {
    await delay(500);
    edusoftData = data;
  },

  async verifyApplications(): Promise<{
    verified: number;
    invalidCredits: number;
    notEnrolled: number;
  }> {
    await delay(1000);
    let verified = 0;
    let invalidCredits = 0;
    let notEnrolled = 0;

    for (const app of applications) {
      if (app.status === 'INSTRUCTOR_ACCEPTED') {
        const edusoftRecord = edusoftData.find(
          (e) => e.studentId === app.studentId
        );

        if (!edusoftRecord || !edusoftRecord.enrolledInThesis) {
          app.status = 'NOT_ENROLLED_EDUSOFT';
          notEnrolled++;
        } else if (edusoftRecord.actualCredits < 100) {
          // Assuming 100 credits required
          app.status = 'INVALID_CREDITS';
          app.actualCredits = edusoftRecord.actualCredits;
          invalidCredits++;
        } else {
          app.status = 'VERIFIED';
          app.actualCredits = edusoftRecord.actualCredits;
          verified++;
        }
        app.updatedAt = new Date();
      }
    }

    return { verified, invalidCredits, notEnrolled };
  },

  async getStatistics() {
    await delay(300);
    const stats = {
      totalTopics: topics.length,
      totalApplications: applications.length,
      pendingReviews: applications.filter(
        (a) => a.status === 'PENDING_INSTRUCTOR_REVIEW'
      ).length,
      acceptedApplications: applications.filter(
        (a) => a.status === 'INSTRUCTOR_ACCEPTED'
      ).length,
      verifiedRegistrations: applications.filter((a) => a.status === 'VERIFIED')
        .length,
      invalidRegistrations: applications.filter(
        (a) =>
          a.status === 'INVALID_CREDITS' ||
          a.status === 'NOT_ENROLLED_EDUSOFT' ||
          a.status === 'DEPARTMENT_REVOKED'
      ).length,
    };
    return stats;
  },
};
