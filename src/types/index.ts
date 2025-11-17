// User Types
export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  major: string;
  creditsCompleted: number;
  englishProficiency: boolean;
}

export interface Instructor extends User {
  role: 'instructor';
  department: string;
  researchAreas: string[];
}

export interface Admin extends User {
  role: 'admin';
  department: string;
}

// Registration Status Types
export type RegistrationStatus =
  | 'PENDING_INSTRUCTOR_REVIEW'
  | 'INSTRUCTOR_ACCEPTED'
  | 'INSTRUCTOR_DENIED'
  | 'VERIFIED'
  | 'INVALID_CREDITS'
  | 'NOT_ENROLLED_EDUSOFT'
  | 'DEPARTMENT_REVOKED';

// Topic Types
export interface ThesisTopic {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  requiredSkills: string[];
  researchArea: string;
  totalSlots: number;
  availableSlots: number;
  pendingApplications: number;
  createdAt: Date;
  updatedAt: Date;
}

// Application Types
export interface ThesisApplication {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  topicId: string;
  topicTitle: string;
  instructorId: string;
  instructorName: string;
  status: RegistrationStatus;
  selfReportedCredits: number;
  actualCredits?: number;
  motivationLetter?: string;
  documents: UploadedDocument[];
  createdAt: Date;
  updatedAt: Date;
  instructorNotes?: string;
  departmentNotes?: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

// EDUSoft Data Types
export interface EDUSoftStudent {
  studentId: string;
  name: string;
  major: string;
  enrolledInThesis: boolean;
  actualCredits: number;
  englishProficiency: boolean;
  semester: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

// Statistics Types
export interface DashboardStats {
  totalTopics: number;
  totalApplications: number;
  pendingReviews: number;
  acceptedApplications: number;
  verifiedRegistrations: number;
  invalidRegistrations: number;
}

// Form Types
export interface ApplicationFormData {
  topicId: string;
  selfReportedCredits: number;
  motivationLetter: string;
  documents: File[];
}

export interface TopicFormData {
  title: string;
  description: string;
  requiredSkills: string[];
  researchArea: string;
  totalSlots: number;
}
