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
    userId: 'STU001',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    role: 'student',
    studentId: 'STU001',
    major: 'Computer Science',
    creditsCompleted: 120,
    englishProficiency: true,
  },
  {
    id: 'student-2',
    userId: 'STU002',
    fullName: 'Bob Smith',
    email: 'bob.smith@university.edu',
    role: 'student',
    studentId: 'STU002',
    major: 'Software Engineering',
    creditsCompleted: 115,
    englishProficiency: true,
  },
  {
    id: 'student-3',
    userId: 'STU003',
    fullName: 'Carol Williams',
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
    userId: 'INST001',
    fullName: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'instructor',
    department: 'Computer Science',
    researchAreas: ['Machine Learning', 'Computer Vision'],
  },
  {
    id: 'instructor-2',
    userId: 'INST002',
    fullName: 'Dr. Sarah Brown',
    email: 'sarah.brown@university.edu',
    role: 'instructor',
    department: 'Software Engineering',
    researchAreas: ['Software Architecture', 'DevOps'],
  },
  {
    id: 'instructor-3',
    userId: 'INST003',
    fullName: 'Dr. James Wilson',
    email: 'james.wilson@university.edu',
    role: 'instructor',
    department: 'Data Science',
    researchAreas: ['Big Data', 'Data Mining'],
  },
];

export const mockAdmins: Admin[] = [
  {
    id: 'admin-1',
    userId: 'ADMIN001',
    fullName: 'Admin User',
    email: 'admin@university.edu',
    role: 'admin',
    department: 'Academic Affairs',
  },
];

// Mock Topics
export const mockTopics: ThesisTopic[] = [
  {
    id: 'topic-1',
    topicCode: 'HK251-LVTN-001',
    semester: 'HK251',
    topicType: 'LVTN',
    titleVn: 'Ứng dụng Deep Learning trong phân tích hình ảnh y khoa',
    titleEn: 'Deep Learning for Medical Image Analysis',
    description:
      'Nghiên cứu ứng dụng các kỹ thuật deep learning để phát hiện bệnh trong hình ảnh y khoa như X-quang và MRI. Đề tài tập trung vào việc xây dựng và đánh giá các mô hình CNN cho việc phân loại và phát hiện bất thường trong hình ảnh y tế.',
    instructorId: 'instructor-1',
    instructor: {
      id: 'instructor-1',
      userId: '003282',
      fullName: 'TS. Michael Chen',
      email: 'michael.chen@university.edu',
      department: 'Khoa Khoa học Máy tính',
    },
    maxStudents: 3,
    currentStudents: 1,
    status: 'ACTIVE',
    programTypes: ['CQ', 'CN'],
    department: 'Computer Science',
    phase1Requirements:
      'Tìm hiểu các kiến trúc CNN phổ biến (ResNet, VGG, U-Net). Nghiên cứu các bộ dataset y khoa công khai. Xây dựng baseline model và đánh giá hiệu suất ban đầu.',
    phase2Requirements:
      'Cải tiến mô hình với các kỹ thuật augmentation và transfer learning. Triển khai hệ thống phát hiện bệnh với giao diện web. Đánh giá toàn diện với các metrics y khoa (Sensitivity, Specificity, AUC-ROC).',
    references: [
      { text: 'LeCun, Y., Bengio, Y., & Hinton, G. (2015). Deep learning. Nature, 521(7553), 436-444.' },
      { text: 'Ronneberger, O., Fischer, P., & Brox, T. (2015). U-Net: Convolutional Networks for Biomedical Image Segmentation.' },
      { text: 'Rajpurkar, P., et al. (2017). CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning.' },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
  },
  {
    id: 'topic-2',
    topicCode: 'HK251-LVTN-002',
    semester: 'HK251',
    topicType: 'LVTN',
    titleVn: 'Nghiên cứu và triển khai các mẫu kiến trúc Microservices',
    titleEn: 'Microservices Architecture Patterns',
    description:
      'Nghiên cứu và triển khai các mẫu thiết kế microservices cho ứng dụng doanh nghiệp có khả năng mở rộng. Đề tài bao gồm việc thiết kế, triển khai và đánh giá hiệu suất của các hệ thống phân tán.',
    instructorId: 'instructor-2',
    instructor: {
      id: 'instructor-2',
      userId: '003145',
      fullName: 'PGS. TS. Sarah Brown',
      email: 'sarah.brown@university.edu',
      department: 'Khoa Công nghệ Phần mềm',
    },
    maxStudents: 2,
    currentStudents: 1,
    status: 'ACTIVE',
    programTypes: ['CQ', 'CN', 'B2'],
    department: 'Software Engineering',
    phase1Requirements:
      'Tìm hiểu các mẫu thiết kế microservices (Saga, CQRS, Event Sourcing). Phân tích các case study từ các công ty lớn (Netflix, Uber). Thiết kế kiến trúc hệ thống demo.',
    phase2Requirements:
      'Triển khai hệ thống microservices hoàn chỉnh với ít nhất 5 services. Implement CI/CD pipeline. Thực hiện load testing và performance optimization. Viết tài liệu kiến trúc chi tiết.',
    references: [
      { text: 'Newman, S. (2021). Building Microservices: Designing Fine-Grained Systems. O\'Reilly Media.' },
      { text: 'Richardson, C. (2018). Microservices Patterns: With Examples in Java. Manning Publications.' },
      { text: 'Fowler, M. (2014). Microservices - a definition of this new architectural term.' },
    ],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-11',
  },
  {
    id: 'topic-3',
    topicCode: 'HK251-DATN-003',
    semester: 'HK251',
    topicType: 'DATN',
    titleVn: 'Xử lý dữ liệu thời gian thực với Apache Kafka',
    titleEn: 'Real-time Data Processing with Apache Kafka',
    description:
      'Xây dựng pipeline xử lý dữ liệu thời gian thực sử dụng Apache Kafka cho việc xử lý streaming data. Đề tài hướng đến việc thiết kế và triển khai hệ thống có khả năng xử lý hàng triệu events mỗi giây.',
    instructorId: 'instructor-3',
    instructor: {
      id: 'instructor-3',
      userId: '003567',
      fullName: 'ThS. James Wilson',
      email: 'james.wilson@university.edu',
      department: 'Khoa Khoa học Dữ liệu',
    },
    maxStudents: 4,
    currentStudents: 0,
    status: 'ACTIVE',
    programTypes: ['CQ', 'CN', 'SN'],
    department: 'Data Science',
    phase1Requirements:
      'Nghiên cứu kiến trúc Apache Kafka và các concepts cơ bản. Tìm hiểu Kafka Streams và KSQL. Thiết kế use case cụ thể (real-time analytics, event-driven architecture).',
    phase2Requirements:
      'Triển khai Kafka cluster với monitoring (Prometheus, Grafana). Xây dựng producer và consumer applications. Implement exactly-once semantics. Benchmark và optimize performance.',
    references: [
      { text: 'Narkhede, N., Shapira, G., & Palino, T. (2017). Kafka: The Definitive Guide. O\'Reilly Media.' },
      { text: 'Kleppmann, M. (2017). Designing Data-Intensive Applications. O\'Reilly Media.' },
      { text: 'Stopford, B. (2018). Designing Event-Driven Systems. O\'Reilly Media.' },
    ],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-12',
  },
  {
    id: 'topic-4',
    topicCode: 'HK251-LVTN-004',
    semester: 'HK251',
    topicType: 'LVTN',
    titleVn: 'Xử lý ngôn ngữ tự nhiên cho phân tích cảm xúc',
    titleEn: 'Natural Language Processing for Sentiment Analysis',
    description:
      'Phát triển các mô hình NLP để phân tích cảm xúc trong bài đăng mạng xã hội và đánh giá sản phẩm. Đề tài tập trung vào việc xây dựng mô hình có thể xử lý tiếng Việt và đánh giá đa chiều.',
    instructorId: 'instructor-1',
    instructor: {
      id: 'instructor-1',
      userId: '003282',
      fullName: 'TS. Michael Chen',
      email: 'michael.chen@university.edu',
      department: 'Khoa Khoa học Máy tính',
    },
    maxStudents: 2,
    currentStudents: 2,
    status: 'FULL',
    programTypes: ['CQ', 'CN'],
    department: 'Computer Science',
    phase1Requirements:
      'Tìm hiểu các phương pháp NLP truyền thống và hiện đại. Thu thập và tiền xử lý dataset tiếng Việt. Xây dựng baseline với các mô hình cơ bản (LSTM, GRU).',
    phase2Requirements:
      'Fine-tune các pre-trained models (PhoBERT, mBERT). Xây dựng aspect-based sentiment analysis. Triển khai API và demo application. So sánh hiệu suất với các phương pháp khác.',
    references: [
      { text: 'Devlin, J., et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding.' },
      { text: 'Nguyen, D. Q., & Nguyen, A. T. (2020). PhoBERT: Pre-trained language models for Vietnamese.' },
      { text: 'Zhang, L., Wang, S., & Liu, B. (2018). Deep learning for sentiment analysis: A survey.' },
    ],
    createdAt: '2024-01-04',
    updatedAt: '2024-01-13',
  },
];

// Mock Applications
// Note: This mock data is not used by the live application which uses the real API
export const mockApplications: ThesisApplication[] = [
  {
    id: 'app-1',
    studentId: 'student-1',
    topicId: 'topic-1',
    status: 'PENDING_INSTRUCTOR_REVIEW',
    creditsClaimed: 120,
    motivationLetter:
      'I am passionate about applying AI to healthcare and have completed relevant coursework in machine learning.',
    transcriptUrl: '/uploads/transcript.pdf',
    student: {
      id: 'student-1',
      userId: 'STU001',
      fullName: 'Alice Johnson',
      email: 'alice.johnson@university.edu',
    },
    topic: {
      id: 'topic-1',
      titleVn: 'Ứng dụng Deep Learning trong phân tích hình ảnh y khoa',
      instructor: {
        id: 'instructor-1',
        fullName: 'TS. Michael Chen',
        email: 'michael.chen@university.edu',
      },
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-2',
    studentId: 'student-2',
    topicId: 'topic-2',
    status: 'INSTRUCTOR_ACCEPTED',
    creditsClaimed: 115,
    creditsVerified: 115,
    motivationLetter:
      'I have extensive experience with Docker and Kubernetes from my internship.',
    transcriptUrl: '/uploads/transcript2.pdf',
    instructorComment: 'Strong candidate with relevant experience.',
    student: {
      id: 'student-2',
      userId: 'STU002',
      fullName: 'Bob Smith',
      email: 'bob.smith@university.edu',
    },
    topic: {
      id: 'topic-2',
      titleVn: 'Nghiên cứu và triển khai các mẫu kiến trúc Microservices',
      instructor: {
        id: 'instructor-2',
        fullName: 'PGS. TS. Sarah Brown',
        email: 'sarah.brown@university.edu',
      },
    },
    createdAt: '2024-01-16',
    updatedAt: '2024-01-17',
  },
  {
    id: 'app-3',
    studentId: 'student-3',
    topicId: 'topic-2',
    status: 'INSTRUCTOR_DENIED',
    creditsClaimed: 95,
    motivationLetter: 'I want to learn about microservices.',
    transcriptUrl: '/uploads/transcript3.pdf',
    instructorComment: 'Insufficient credits and missing prerequisite skills.',
    student: {
      id: 'student-3',
      userId: 'STU003',
      fullName: 'Carol Williams',
      email: 'carol.williams@university.edu',
    },
    topic: {
      id: 'topic-2',
      titleVn: 'Nghiên cứu và triển khai các mẫu kiến trúc Microservices',
      instructor: {
        id: 'instructor-2',
        fullName: 'PGS. TS. Sarah Brown',
        email: 'sarah.brown@university.edu',
      },
    },
    createdAt: '2024-01-17',
    updatedAt: '2024-01-18',
  },
  {
    id: 'app-4',
    studentId: 'student-1',
    topicId: 'topic-4',
    status: 'VERIFIED',
    creditsClaimed: 120,
    creditsVerified: 120,
    motivationLetter: 'I have strong interest in NLP and have completed related projects.',
    transcriptUrl: '/uploads/transcript4.pdf',
    instructorComment: 'Excellent candidate.',
    departmentComment: 'Verified against EDUSoft records.',
    student: {
      id: 'student-1',
      userId: 'STU001',
      fullName: 'Alice Johnson',
      email: 'alice.johnson@university.edu',
    },
    topic: {
      id: 'topic-4',
      titleVn: 'Xử lý ngôn ngữ tự nhiên cho phân tích cảm xúc',
      instructor: {
        id: 'instructor-1',
        fullName: 'TS. Michael Chen',
        email: 'michael.chen@university.edu',
      },
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
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
