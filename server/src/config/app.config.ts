import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Registration period
  registrationStartDate: process.env.REGISTRATION_START_DATE || '2024-02-01',
  registrationEndDate: process.env.REGISTRATION_END_DATE || '2024-02-14',
  verificationStartDate: process.env.VERIFICATION_START_DATE || '2024-02-15',

  // System limits
  maxApplicationsPerStudent:
    parseInt(process.env.MAX_APPLICATIONS_PER_STUDENT, 10) || 3,
  maxStudentsPerInstructor:
    parseInt(process.env.MAX_STUDENTS_PER_INSTRUCTOR, 10) || 10,
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 3600000,

  // File upload
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
  allowedFileTypes:
    process.env.ALLOWED_FILE_TYPES ||
    'pdf,doc,docx,xls,xlsx,png,jpg,jpeg',

  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,
  redisPassword: process.env.REDIS_PASSWORD || '',

  // Email
  mailHost: process.env.MAIL_HOST || 'smtp.gmail.com',
  mailPort: parseInt(process.env.MAIL_PORT, 10) || 587,
  mailUser: process.env.MAIL_USER || '',
  mailPassword: process.env.MAIL_PASSWORD || '',
  mailFrom: process.env.MAIL_FROM || 'Thesis System <noreply@university.edu.vn>',

  // Bcrypt
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
}));
