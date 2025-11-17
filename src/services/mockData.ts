import {
  ThesisTopic,
  ThesisApplication,
  Student,
  Instructor,
  Admin,
  EDUSoftStudent,
  Notification,
} from '../types';

// Mock Users
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    role: 'student',
    studentId: 'STU001',
    major: 'Computer Science',
    creditsCompleted: 120,
    englishProficiency: true,
  },
  {
    id: 'student-2',
    name: 'Bob Smith',
    email: 'bob.smith@university.edu',
    role: 'student',
    studentId: 'STU002',
    major: 'Software Engineering',
    creditsCompleted: 115,
    englishProficiency: true,
  },
  {
    id: 'student-3',
    name: 'Carol Williams',
    email: 'carol.williams@university.edu',
    role: 'student',
    studentId: 'STU003',
    major: 'Data Science',
    creditsCompleted: 95,
    englishProficiency: false,
  },
];

export const mockInstructors: Instructor[] = [
  {
    id: 'instructor-1',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'instructor',
    department: 'Computer Science',
    researchAreas: ['Machine Learning', 'Computer Vision'],
  },
  {
    id: 'instructor-2',
    name: 'Dr. Sarah Brown',
    email: 'sarah.brown@university.edu',
    role: 'instructor',
    department: 'Software Engineering',
    researchAreas: ['Software Architecture', 'DevOps'],
  },
  {
    id: 'instructor-3',
    name: 'Dr. James Wilson',
    email: 'james.wilson@university.edu',
    role: 'instructor',
    department: 'Data Science',
    researchAreas: ['Big Data', 'Data Mining'],
  },
];

export const mockAdmins: Admin[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@university.edu',
    role: 'admin',
    department: 'Academic Affairs',
  },
];

// Mock Topics
export const mockTopics: ThesisTopic[] = [
  {
    id: 'topic-1',
    title: 'Deep Learning for Medical Image Analysis',
    description:
      'Research on applying deep learning techniques for detecting diseases in medical images such as X-rays and MRIs.',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Michael Chen',
    instructorEmail: 'michael.chen@university.edu',
    requiredSkills: ['Python', 'TensorFlow', 'Computer Vision'],
    researchArea: 'Machine Learning',
    totalSlots: 3,
    availableSlots: 2,
    pendingApplications: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'topic-2',
    title: 'Microservices Architecture Patterns',
    description:
      'Study and implementation of various microservices patterns for scalable enterprise applications.',
    instructorId: 'instructor-2',
    instructorName: 'Dr. Sarah Brown',
    instructorEmail: 'sarah.brown@university.edu',
    requiredSkills: ['Docker', 'Kubernetes', 'REST APIs'],
    researchArea: 'Software Architecture',
    totalSlots: 2,
    availableSlots: 1,
    pendingApplications: 2,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: 'topic-3',
    title: 'Real-time Data Processing with Apache Kafka',
    description:
      'Building a real-time data pipeline using Apache Kafka for processing streaming data.',
    instructorId: 'instructor-3',
    instructorName: 'Dr. James Wilson',
    instructorEmail: 'james.wilson@university.edu',
    requiredSkills: ['Java', 'Apache Kafka', 'Distributed Systems'],
    researchArea: 'Big Data',
    totalSlots: 4,
    availableSlots: 4,
    pendingApplications: 0,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'topic-4',
    title: 'Natural Language Processing for Sentiment Analysis',
    description:
      'Developing NLP models for analyzing sentiment in social media posts and product reviews.',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Michael Chen',
    instructorEmail: 'michael.chen@university.edu',
    requiredSkills: ['Python', 'NLP', 'Deep Learning'],
    researchArea: 'Machine Learning',
    totalSlots: 2,
    availableSlots: 0,
    pendingApplications: 0,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-13'),
  },
];

// Mock Applications
export const mockApplications: ThesisApplication[] = [
  {
    id: 'app-1',
    studentId: 'STU001',
    studentName: 'Alice Johnson',
    studentEmail: 'alice.johnson@university.edu',
    topicId: 'topic-1',
    topicTitle: 'Deep Learning for Medical Image Analysis',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Michael Chen',
    status: 'PENDING_INSTRUCTOR_REVIEW',
    selfReportedCredits: 120,
    motivationLetter:
      'I am passionate about applying AI to healthcare and have completed relevant coursework in machine learning.',
    documents: [
      {
        id: 'doc-1',
        name: 'transcript.pdf',
        type: 'application/pdf',
        url: '/uploads/transcript.pdf',
        uploadedAt: new Date('2024-01-15'),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'app-2',
    studentId: 'STU002',
    studentName: 'Bob Smith',
    studentEmail: 'bob.smith@university.edu',
    topicId: 'topic-2',
    topicTitle: 'Microservices Architecture Patterns',
    instructorId: 'instructor-2',
    instructorName: 'Dr. Sarah Brown',
    status: 'INSTRUCTOR_ACCEPTED',
    selfReportedCredits: 115,
    actualCredits: 115,
    motivationLetter:
      'I have extensive experience with Docker and Kubernetes from my internship.',
    documents: [
      {
        id: 'doc-2',
        name: 'transcript.pdf',
        type: 'application/pdf',
        url: '/uploads/transcript2.pdf',
        uploadedAt: new Date('2024-01-16'),
      },
    ],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-17'),
    instructorNotes: 'Strong candidate with relevant experience.',
  },
  {
    id: 'app-3',
    studentId: 'STU003',
    studentName: 'Carol Williams',
    studentEmail: 'carol.williams@university.edu',
    topicId: 'topic-2',
    topicTitle: 'Microservices Architecture Patterns',
    instructorId: 'instructor-2',
    instructorName: 'Dr. Sarah Brown',
    status: 'INSTRUCTOR_DENIED',
    selfReportedCredits: 95,
    motivationLetter: 'I want to learn about microservices.',
    documents: [
      {
        id: 'doc-3',
        name: 'transcript.pdf',
        type: 'application/pdf',
        url: '/uploads/transcript3.pdf',
        uploadedAt: new Date('2024-01-17'),
      },
    ],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
    instructorNotes: 'Insufficient credits and missing prerequisite skills.',
  },
  {
    id: 'app-4',
    studentId: 'STU001',
    studentName: 'Alice Johnson',
    studentEmail: 'alice.johnson@university.edu',
    topicId: 'topic-4',
    topicTitle: 'Natural Language Processing for Sentiment Analysis',
    instructorId: 'instructor-1',
    instructorName: 'Dr. Michael Chen',
    status: 'VERIFIED',
    selfReportedCredits: 120,
    actualCredits: 120,
    motivationLetter: 'I have strong interest in NLP and have completed related projects.',
    documents: [
      {
        id: 'doc-4',
        name: 'transcript.pdf',
        type: 'application/pdf',
        url: '/uploads/transcript4.pdf',
        uploadedAt: new Date('2024-01-10'),
      },
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    instructorNotes: 'Excellent candidate.',
    departmentNotes: 'Verified against EDUSoft records.',
  },
];

// Mock EDUSoft Data
export const mockEDUSoftData: EDUSoftStudent[] = [
  {
    studentId: 'STU001',
    name: 'Alice Johnson',
    major: 'Computer Science',
    enrolledInThesis: true,
    actualCredits: 120,
    englishProficiency: true,
    semester: 'Fall 2024',
  },
  {
    studentId: 'STU002',
    name: 'Bob Smith',
    major: 'Software Engineering',
    enrolledInThesis: true,
    actualCredits: 115,
    englishProficiency: true,
    semester: 'Fall 2024',
  },
  {
    studentId: 'STU003',
    name: 'Carol Williams',
    major: 'Data Science',
    enrolledInThesis: false,
    actualCredits: 95,
    englishProficiency: false,
    semester: 'Fall 2024',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'student-1',
    title: 'Application Submitted',
    message: 'Your application for "Deep Learning for Medical Image Analysis" has been submitted.',
    type: 'success',
    read: false,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'notif-2',
    userId: 'instructor-1',
    title: 'New Application',
    message: 'Alice Johnson has applied for your topic "Deep Learning for Medical Image Analysis".',
    type: 'info',
    read: false,
    createdAt: new Date('2024-01-15'),
  },
];
