// User Types
export type UserRole = 'student' | 'instructor' | 'admin' | 'department';

export interface User {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  major?: string;
  program?: string;
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

// Topic Types (matching server enums)
export type TopicType = 'DCLV' | 'DACN' | 'DAMHKTMT' | 'LVTN' | 'DATN';
export type TopicStatus = 'ACTIVE' | 'INACTIVE' | 'FULL';
export type ProgramType = 'CQ' | 'CN' | 'B2' | 'SN' | 'VLVH' | 'TX';

// Instructor info from Topic response
export interface TopicInstructor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  department: string | null;
}

// Reference format from server
export interface TopicReference {
  text: string;
  url?: string;
}

// Topic model matching server response
export interface ThesisTopic {
  id: string;
  topicCode: string;
  semester: string;
  topicType: TopicType;
  titleVn: string;
  titleEn?: string | null;
  description: string;
  phase1Requirements?: string | null;
  phase2Requirements?: string | null;
  maxStudents: number;
  currentStudents: number;
  programTypes: string[];
  prerequisites?: string | null;
  references?: TopicReference[] | null;
  status: TopicStatus;
  department: string;
  instructorId: string;
  instructor: TopicInstructor;
  _count?: {
    registrations: number;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Application/Registration Types (matching server response)
export interface ThesisApplication {
  id: string;
  status: RegistrationStatus;
  creditsClaimed?: number | null;
  creditsVerified?: number | null;
  transcriptUrl?: string | null;
  motivationLetter?: string | null;
  instructorComment?: string | null;
  departmentComment?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | Date | null;
  verifiedBy?: string | null;
  verifiedAt?: string | Date | null;
  studentId: string;
  student?: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    major?: string | null;
    program?: string | null;
  };
  topicId: string;
  topic?: {
    id: string;
    titleVn: string;
    titleEn?: string | null;
    topicCode?: string;
    description?: string;
    instructor?: {
      id: string;
      fullName: string;
      email: string;
    };
  };
  createdAt: string | Date;
  updatedAt: string | Date;
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

// Form Types (matching server DTOs)
export interface ApplicationFormData {
  topicId: string;
  creditsClaimed?: number;
  motivationLetter?: string;
  transcriptFile?: File;
}

export interface TopicFormData {
  topicCode: string;
  semester: string;
  topicType: TopicType;
  titleVn: string;
  titleEn?: string;
  description: string;
  phase1Requirements?: string;
  phase2Requirements?: string;
  references?: TopicReference[];
  prerequisites?: string;
  programTypes: string[];
  department: string;
  maxStudents: number;
}
