import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class AppConfigService {
  constructor() {
    dotenv.config({
      path: `.env`,
    });

    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName]?.replace(/\\n/g, '\n');
    }
  }

  public get(key: string): string {
    return process.env[key] || '';
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  get isDev(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProd(): boolean {
    return this.nodeEnv === 'production';
  }

  // App Configuration
  get appConfig() {
    return {
      nodeEnv: this.nodeEnv,
      port: this.getNumber('PORT') || 3000,
      apiPrefix: this.get('API_PREFIX') || 'api',
      corsOrigin: this.get('CORS_ORIGIN') || '*',

      // Registration period
      registrationStartDate:
        this.get('REGISTRATION_START_DATE') || '2024-02-01',
      registrationEndDate: this.get('REGISTRATION_END_DATE') || '2024-02-14',
      verificationStartDate:
        this.get('VERIFICATION_START_DATE') || '2024-02-15',

      // System limits
      maxApplicationsPerStudent:
        this.getNumber('MAX_APPLICATIONS_PER_STUDENT') || 3,
      maxStudentsPerInstructor:
        this.getNumber('MAX_STUDENTS_PER_INSTRUCTOR') || 10,
      sessionTimeout: this.getNumber('SESSION_TIMEOUT') || 3600000,

      // File upload
      uploadDest: this.get('UPLOAD_DEST') || './uploads',
      maxFileSize: this.getNumber('MAX_FILE_SIZE') || 10485760, // 10MB
      allowedFileTypes:
        this.get('ALLOWED_FILE_TYPES') || 'pdf,doc,docx,xls,xlsx,png,jpg,jpeg',

      // Bcrypt
      bcryptSaltRounds: this.getNumber('BCRYPT_SALT_ROUNDS') || 10,
    };
  }

  // Database Configuration
  get databaseConfig() {
    return {
      url: this.get('DATABASE_URL'),
    };
  }

  // Redis Configuration
  get redisConfig() {
    return {
      host: this.get('REDIS_HOST') || 'localhost',
      port: this.getNumber('REDIS_PORT') || 6379,
      password: this.get('REDIS_PASSWORD') || '',
    };
  }

  // JWT Configuration
  get jwtConfig() {
    return {
      secret: this.get('JWT_SECRET') || 'your-super-secret-jwt-key-change-this',
      expiresIn: this.get('JWT_EXPIRATION') || '7d',
      refreshSecret:
        this.get('JWT_REFRESH_SECRET') || 'your-refresh-secret-key-change-this',
      refreshExpiresIn: this.get('JWT_REFRESH_EXPIRATION') || '30d',
    };
  }

  // winston Config
  get winstonConfig() {
    return {
      transports: [
        new DailyRotateFile({
          level: 'debug',
          filename: `./logs/${this.nodeEnv}/debug-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new DailyRotateFile({
          level: 'error',
          filename: `./logs/${this.nodeEnv}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss',
            }),
            winston.format.printf(
              ({ level, message, timestamp, context, trace }) => {
                const ctx = context ? ` [${context}]` : '';
                const msgStr =
                  typeof message === 'string'
                    ? message
                    : JSON.stringify(message);
                const stackStr = trace ? `\n${trace}` : '';
                return `${timestamp} ${level}:${ctx} ${msgStr}${stackStr}`;
              },
            ),
          ),
        }),
      ],
      exitOnError: false,
    };
  }

  // Email Configuration
  get emailConfig() {
    return {
      host: this.get('MAIL_HOST') || 'smtp.gmail.com',
      port: this.getNumber('MAIL_PORT') || 587,
      user: this.get('MAIL_USER') || '',
      password: this.get('MAIL_PASSWORD') || '',
      from:
        this.get('MAIL_FROM') || 'Thesis System <noreply@university.edu.vn>',
    };
  }
}
