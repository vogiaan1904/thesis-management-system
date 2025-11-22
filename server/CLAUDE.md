# Always update this CLAUDE.md file to be up-to-date with the context

# Thesis Registration System - Backend Specification

## Recent Changes (2024)

### Department Admin Registration Filtering
- **`getAllRegistrations()`** now filters out `PENDING_INSTRUCTOR_REVIEW` and `INSTRUCTOR_DENIED` statuses by default
- Department admin only sees registrations that have been accepted by instructors and beyond:
  - `INSTRUCTOR_ACCEPTED`
  - `VERIFIED`
  - `INVALID_CREDITS`
  - `NOT_ENROLLED_EDUSOFT`
  - `DEPARTMENT_REVOKED`
- **Excel export** for registrations also follows this filtering logic
- If a specific status filter is provided via query parameter, that filter takes precedence

### API Field Name Fixes
- Review endpoint expects `comment` field (not `notes`) in the request body for instructor comments

---

## Registration & Verification Flow

### Overview
The thesis registration system follows a multi-step verification process:

1. **Student Application Phase**: Students apply for thesis topics
2. **Instructor Review Phase**: Instructors accept/reject applications
3. **Verification Phase**: Department admin verifies accepted registrations against EDUSoft data

### Phase 1: Student Application
- Students browse available topics and submit applications
- Application includes: topic selection, self-reported credits (`creditsClaimed`), motivation letter
- Status: `PENDING_INSTRUCTOR_REVIEW`

### Phase 2: Instructor Review
- Instructors review pending applications for their topics
- Decision: ACCEPT or REJECT with optional comment
- Status changes to: `INSTRUCTOR_ACCEPTED` or `INSTRUCTOR_DENIED`

### Phase 3: EDUSoft Verification (Post-Registration Period)

After the registration period closes, the department admin performs batch verification:

#### Step 1: Upload EDUSoft Data
Admin uploads an Excel file (.xls/.xlsx) exported from EDUSoft containing enrolled students data.

**Expected Excel Format (from EDUSoft Report):**
| Column | Description |
|--------|-------------|
| No. | Row number (Column 1 - skipped) |
| Student ID | Student identifier e.g., ITITIU20001 (Column 2 - match key) |
| Full name | Student's full name (Column 3) |
| Date of birth | Student's date of birth (Column 4) |
| Class | Student's class/cohort (Column 5) |
| Credits | Student's accumulated credits (Column 6 - optional) |

**Note**: If the Credits column (Column 6) is present and contains numeric values, the system will validate that the student's credits meet the claimed credits. If the column is empty or missing, students found in the Excel are automatically verified.

#### Step 2: Verification Process
The server processes the uploaded file and validates `INSTRUCTOR_ACCEPTED` registrations:

```
For each INSTRUCTOR_ACCEPTED registration:
1. Find student in uploaded EDUSoft data (match by Student ID)
2. Apply validation rules:
   - Student NOT found in Excel → Status: NOT_ENROLLED_EDUSOFT
   - Student found, credits insufficient → Status: INVALID_CREDITS
   - Student found, all checks pass → Status: VERIFIED
```

#### Step 3: Verification Results
- **VERIFIED**: Student is enrolled in thesis course on EDUSoft and meets requirements
- **NOT_ENROLLED_EDUSOFT**: Student has not registered for thesis course on EDUSoft system
- **INVALID_CREDITS**: Student does not have enough credits (when credit validation is implemented)
- **DEPARTMENT_REVOKED**: Manually revoked by department admin

### Registration Status Flow
```
PENDING_INSTRUCTOR_REVIEW
    ├── INSTRUCTOR_ACCEPTED
    │       ├── VERIFIED
    │       ├── INVALID_CREDITS
    │       ├── NOT_ENROLLED_EDUSOFT
    │       └── DEPARTMENT_REVOKED
    └── INSTRUCTOR_DENIED
```

### API Endpoints for Verification
- `POST /api/verification/upload` - Upload EDUSoft Excel file
- `GET /api/verification/history` - View past verification batches
- `GET /api/verification/latest` - Get latest verification results
- `POST /api/verification/process/:batchId` - Reprocess a verification batch

## Project Overview
Build a NestJS backend for a university thesis registration system where students apply for thesis topics, instructors approve/deny applications, and the department performs batch verification against EDUSoft data.

## Technology Stack Requirements

### Core Technologies
```yaml
Framework: NestJS v10.3.0+
Language: TypeScript v5.3.0+
Runtime: Node.js v18.19.0 LTS
Package Manager: npm or yarn
```

### Dependencies to Install
```bash
# Core NestJS packages
@nestjs/common @nestjs/core @nestjs/platform-express
@nestjs/config @nestjs/swagger

# Database - Prisma ORM
prisma --save-dev
@prisma/client

# Authentication
@nestjs/passport @nestjs/jwt passport passport-jwt passport-local
bcrypt @types/bcrypt

# Validation
class-validator class-transformer

# File Processing
@nestjs/platform-express multer @types/multer
exceljs

# Queue & Scheduling
@nestjs/bull bull @nestjs/schedule

# WebSocket
@nestjs/websockets @nestjs/platform-socket.io socket.io

# Email
@nestjs-modules/mailer nodemailer handlebars

# Utilities
dayjs uuid @types/uuid

# Development
@types/node typescript ts-node
```

## Project Structure

```
thesis-backend/
├── prisma/
│   ├── schema.prisma                     # Prisma schema (models, enums, relations)
│   ├── migrations/                       # Prisma migrations
│   └── seed.ts                           # Database seeding script
├── src/
│   ├── main.ts                           # Application entry point
│   ├── app.module.ts                     # Root module
│   ├── common/                           # Shared resources
│   │   ├── constants/
│   │   │   ├── status.constants.ts       # All status enums
│   │   │   └── roles.constants.ts        # User roles enum
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts        # @Roles() decorator
│   │   │   └── current-user.decorator.ts # @CurrentUser() decorator
│   │   ├── dto/
│   │   │   └── pagination.dto.ts         # Common pagination DTO
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Global exception filter
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts         # JWT authentication guard
│   │   │   └── roles.guard.ts            # Role-based access guard
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts  # Response transformation
│   │   └── pipes/
│   │       └── validation.pipe.ts        # Global validation pipe
│   ├── config/
│   │   ├── database.config.ts            # Database configuration
│   │   ├── jwt.config.ts                 # JWT configuration
│   │   └── app.config.ts                 # Application configuration
│   ├── prisma/
│   │   ├── prisma.module.ts              # Prisma module
│   │   └── prisma.service.ts             # Prisma service (client wrapper)
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── local.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── register.dto.ts
│       ├── topics/
│       │   ├── topics.module.ts
│       │   ├── topics.controller.ts
│       │   ├── topics.service.ts
│       │   └── dto/
│       │       ├── create-topic.dto.ts
│       │       ├── update-topic.dto.ts
│       │       └── topic-filter.dto.ts
│       ├── registrations/
│       │   ├── registrations.module.ts
│       │   ├── registrations.controller.ts
│       │   ├── registrations.service.ts
│       │   ├── registrations.gateway.ts   # WebSocket gateway
│       │   └── dto/
│       │       ├── apply-topic.dto.ts
│       │       ├── review-application.dto.ts
│       │       └── registration-filter.dto.ts
│       ├── verification/
│       │   ├── verification.module.ts
│       │   ├── verification.controller.ts
│       │   ├── verification.service.ts
│       │   ├── verification.processor.ts  # Bull queue processor
│       │   └── dto/
│       │       └── upload-verification.dto.ts
│       ├── notifications/
│       │   ├── notifications.module.ts
│       │   ├── notifications.service.ts
│       │   └── templates/                 # Email templates
│       └── reports/
│           ├── reports.module.ts
│           ├── reports.controller.ts
│           └── reports.service.ts
├── test/                                  # Test files
├── uploads/                               # Temporary file uploads
├── .env.example                          # Environment variables example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

### Prisma Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  STUDENT
  INSTRUCTOR
  DEPARTMENT
  ADMIN
}

enum TopicType {
  DCLV
  DACN
  DAMHKTMT
  LVTN
  DATN
}

enum TopicStatus {
  ACTIVE
  INACTIVE
  FULL
}

enum RegistrationStatus {
  PENDING_INSTRUCTOR_REVIEW
  INSTRUCTOR_ACCEPTED
  INSTRUCTOR_DENIED
  VERIFIED
  INVALID_CREDITS
  NOT_ENROLLED_EDUSOFT
  DEPARTMENT_REVOKED
}

// Models
model User {
  id           String   @id @default(uuid())
  userId       String   @unique // Student ID or Employee ID
  fullName     String
  email        String   @unique
  password     String
  role         UserRole @default(STUDENT)
  department   String?
  major        String?
  program      String? // CQ/CN/B2/SN/VLVH/TX
  isActive     Boolean  @default(true)

  // Relations
  registrations Registration[]
  topics        Topic[]        @relation("InstructorTopics")

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}

model Topic {
  id                  String      @id @default(uuid())
  topicCode           String      @unique // Format: HK251-DCLV-010
  semester            String // HK251
  topicType           TopicType
  titleVn             String      @db.Text
  titleEn             String?     @db.Text
  description         String      @db.Text
  phase1Requirements  String?     @db.Text
  phase2Requirements  String?     @db.Text
  maxStudents         Int         @default(1)
  currentStudents     Int         @default(0)
  programTypes        String[] // ['CQ', 'CN', 'B2']
  prerequisites       String?     @db.Text
  references          Json? // Array of { text: string; url?: string }
  status              TopicStatus @default(ACTIVE)
  department          String

  // Relations
  instructorId   String
  instructor     User           @relation("InstructorTopics", fields: [instructorId], references: [id])
  registrations  Registration[]

  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@map("topics")
}

model Registration {
  id                 String             @id @default(uuid())
  status             RegistrationStatus @default(PENDING_INSTRUCTOR_REVIEW)
  creditsClaimed     Int?
  creditsVerified    Int?
  transcriptUrl      String? // Uploaded file path
  motivationLetter   String?            @db.Text
  instructorComment  String?            @db.Text
  departmentComment  String?            @db.Text
  reviewedBy         String? // Instructor ID who reviewed
  reviewedAt         DateTime?
  verifiedBy         String? // Department staff ID
  verifiedAt         DateTime?

  // Relations
  studentId     String
  student       User     @relation(fields: [studentId], references: [id])
  topicId       String
  topic         Topic    @relation(fields: [topicId], references: [id])

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([studentId, topicId])
  @@map("registrations")
}

model VerificationBatch {
  id         String   @id @default(uuid())
  semester   String
  fileName   String
  uploadedBy String
  results    Json // { total: number; verified: number; invalid: number; notEnrolled: number }
  errors     String?  @db.Text

  createdAt  DateTime @default(now())

  @@map("verification_batches")
}
```

### Prisma Client Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## Prisma Setup Commands

### Initial Setup
```bash
# Initialize Prisma (creates prisma folder and schema.prisma)
npx prisma init

# After creating your schema, generate Prisma Client
npx prisma generate

# Create and apply initial migration
npx prisma migrate dev --name init

# Open Prisma Studio to view/edit data
npx prisma studio
```

### Common Commands
```bash
# Create a new migration after schema changes
npx prisma migrate dev --name description_of_changes

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed the database
npx prisma db seed

# Format the schema file
npx prisma format

# Validate the schema
npx prisma validate

# Pull database schema into Prisma schema (reverse engineering)
npx prisma db pull

# Push schema changes without creating migration (development only)
npx prisma db push
```

### Database Seeding
```typescript
// prisma/seed.ts
import { PrismaClient, UserRole, TopicType, TopicStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu.vn' },
    update: {},
    create: {
      userId: 'ADMIN001',
      fullName: 'System Administrator',
      email: 'admin@university.edu.vn',
      password: adminPassword,
      role: UserRole.ADMIN,
      department: 'IT',
    },
  });

  // Create instructor
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@university.edu.vn' },
    update: {},
    create: {
      userId: 'INST001',
      fullName: 'TS. Nguyen Van A',
      email: 'instructor@university.edu.vn',
      password: instructorPassword,
      role: UserRole.INSTRUCTOR,
      department: 'Computer Science',
    },
  });

  // Create sample topic
  await prisma.topic.upsert({
    where: { topicCode: 'HK251-DCLV-001' },
    update: {},
    create: {
      topicCode: 'HK251-DCLV-001',
      semester: 'HK251',
      topicType: TopicType.DCLV,
      titleVn: 'Hệ thống quản lý đăng ký đề tài',
      titleEn: 'Thesis Registration Management System',
      description: 'Build a web-based system for managing thesis registration',
      phase1Requirements: 'Complete proposal document',
      phase2Requirements: 'Implement and test the system',
      maxStudents: 2,
      currentStudents: 0,
      programTypes: ['CQ', 'CN'],
      prerequisites: 'Completed at least 100 credits',
      status: TopicStatus.ACTIVE,
      department: 'Computer Science',
      instructorId: instructor.id,
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to package.json:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## API Endpoints Specification

### Authentication Endpoints
```typescript
POST   /api/auth/login          # Student/Instructor/Department login
POST   /api/auth/register       # User registration (if allowed)
GET    /api/auth/profile        # Get current user profile
POST   /api/auth/refresh        # Refresh JWT token
POST   /api/auth/logout         # Logout (invalidate token)
```

### Topics Endpoints
```typescript
# Public/Student endpoints
GET    /api/topics              # List all active topics with filters
GET    /api/topics/:id          # Get topic details
GET    /api/topics/search       # Search topics by keyword

# Instructor endpoints
POST   /api/topics              # Create new topic (Instructor only)
PUT    /api/topics/:id          # Update topic (Own topics only)
DELETE /api/topics/:id          # Delete topic (Own topics only)
GET    /api/topics/my-topics    # Get instructor's topics
```

### Registration Endpoints
```typescript
# Student endpoints
POST   /api/registrations/apply              # Apply for a topic
GET    /api/registrations/my-applications    # Get student's applications
DELETE /api/registrations/:id                # Withdraw application
PUT    /api/registrations/:id/upload-docs    # Upload/update documents

# Instructor endpoints
GET    /api/registrations/pending-reviews    # Get pending applications
PUT    /api/registrations/:id/review         # Accept/Deny application
GET    /api/registrations/my-students        # Get accepted students

# Department endpoints
GET    /api/registrations                    # Get all registrations
PUT    /api/registrations/:id/override       # Manual override
GET    /api/registrations/invalid            # Get invalid registrations
```

### Verification Endpoints
```typescript
# Department only
POST   /api/verification/upload              # Upload Excel for verification
GET    /api/verification/history             # Get verification history
GET    /api/verification/latest              # Get latest verification results
POST   /api/verification/process/:batchId    # Re-process verification batch
```

### Reports Endpoints
```typescript
GET    /api/reports/summary                  # Overall system summary
GET    /api/reports/instructor-load          # Instructor workload report
GET    /api/reports/department-stats         # Department statistics
GET    /api/reports/export                   # Export data to Excel
```

## Business Logic Implementation

### 1. Registration Flow Logic
```typescript
// src/modules/registrations/registrations.service.ts
import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus, TopicStatus } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private registrationsGateway: RegistrationsGateway,
  ) {}

  async applyForTopic(studentId: string, applyDto: ApplyTopicDto) {
    // Step 1: Check if registration period is open
    if (!this.isRegistrationOpen()) {
      throw new BadRequestException('Registration period is closed');
    }

    // Step 2: Check if student already applied to this topic
    const existingApplication = await this.prisma.registration.findUnique({
      where: {
        studentId_topicId: {
          studentId: studentId,
          topicId: applyDto.topicId
        }
      }
    });

    if (existingApplication) {
      throw new ConflictException('Already applied to this topic');
    }

    // Step 3: Check maximum applications limit (e.g., 3 topics)
    const applicationCount = await this.prisma.registration.count({
      where: {
        studentId: studentId,
        status: {
          notIn: [
            RegistrationStatus.INSTRUCTOR_DENIED,
            RegistrationStatus.DEPARTMENT_REVOKED
          ]
        }
      }
    });

    if (applicationCount >= 3) {
      throw new BadRequestException('Maximum application limit reached');
    }

    // Step 4: Create registration with PENDING status
    const registration = await this.prisma.registration.create({
      data: {
        studentId: studentId,
        topicId: applyDto.topicId,
        creditsClaimed: applyDto.creditsClaimed,
        transcriptUrl: applyDto.transcriptUrl,
        motivationLetter: applyDto.motivationLetter,
        status: RegistrationStatus.PENDING_INSTRUCTOR_REVIEW
      },
      include: {
        student: true,
        topic: {
          include: {
            instructor: true
          }
        }
      }
    });

    // Step 5: Send notifications
    await this.notificationService.notifyInstructor(registration);
    this.registrationsGateway.notifyNewApplication(registration);

    return registration;
  }

  async reviewApplication(instructorId: string, reviewDto: ReviewApplicationDto) {
    // Step 1: Verify instructor owns the topic
    const registration = await this.prisma.registration.findUnique({
      where: { id: reviewDto.registrationId },
      include: {
        topic: {
          include: {
            instructor: true
          }
        },
        student: true
      }
    });

    if (!registration) {
      throw new BadRequestException('Registration not found');
    }

    if (registration.topic.instructorId !== instructorId) {
      throw new ForbiddenException('Not authorized to review this application');
    }

    // Step 2: Check current status
    if (registration.status !== RegistrationStatus.PENDING_INSTRUCTOR_REVIEW) {
      throw new BadRequestException('Application already reviewed');
    }

    // Step 3: Handle acceptance or rejection using transaction
    const updated = await this.prisma.$transaction(async (prisma) => {
      if (reviewDto.decision === 'ACCEPT') {
        // Check if topic is full
        const topic = await prisma.topic.findUnique({
          where: { id: registration.topicId }
        });

        if (topic.currentStudents >= topic.maxStudents) {
          throw new BadRequestException('Topic is full');
        }

        // Update registration status
        const updatedRegistration = await prisma.registration.update({
          where: { id: reviewDto.registrationId },
          data: {
            status: RegistrationStatus.INSTRUCTOR_ACCEPTED,
            reviewedBy: instructorId,
            reviewedAt: new Date(),
            instructorComment: reviewDto.comment
          },
          include: {
            student: true,
            topic: true
          }
        });

        // Increment topic slot count
        const updatedTopic = await prisma.topic.update({
          where: { id: registration.topicId },
          data: {
            currentStudents: {
              increment: 1
            },
            // Set to FULL if all slots are taken
            status: topic.currentStudents + 1 >= topic.maxStudents
              ? TopicStatus.FULL
              : topic.status
          }
        });

        return updatedRegistration;
      } else {
        // Handle rejection
        return await prisma.registration.update({
          where: { id: reviewDto.registrationId },
          data: {
            status: RegistrationStatus.INSTRUCTOR_DENIED,
            reviewedBy: instructorId,
            reviewedAt: new Date(),
            instructorComment: reviewDto.comment
          },
          include: {
            student: true,
            topic: true
          }
        });
      }
    });

    // Step 4: Send notifications
    await this.notificationService.notifyStudent(updated);
    this.registrationsGateway.notifyStatusChange(updated);

    return updated;
  }
}
```

### 2. Verification Logic
```typescript
// src/modules/verification/verification.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

@Processor('verification')
export class VerificationProcessor {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private reportService: ReportService,
  ) {}

  @Process('verify-excel')
  async handleVerification(job: Job<{ batchId: string, filePath: string }>) {
    const { batchId, filePath } = job.data;

    // Step 1: Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);

    const edusoftData = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      edusoftData.push({
        studentId: row.getCell(1).value,
        studentName: row.getCell(2).value,
        enrolledInThesis: row.getCell(3).value === 'Yes',
        actualCredits: Number(row.getCell(4).value),
        englishPassed: row.getCell(5).value === 'Yes'
      });
    });

    // Step 2: Get all INSTRUCTOR_ACCEPTED registrations
    const registrations = await this.prisma.registration.findMany({
      where: {
        status: RegistrationStatus.INSTRUCTOR_ACCEPTED
      },
      include: {
        student: true,
        topic: true
      }
    });

    const results = {
      total: registrations.length,
      verified: 0,
      invalidCredits: 0,
      notEnrolled: 0
    };

    // Step 3: Verify each registration
    for (const registration of registrations) {
      const edusoftRecord = edusoftData.find(
        e => e.studentId === registration.student.userId
      );

      let newStatus: RegistrationStatus;
      let creditsVerified: number | null = null;

      if (!edusoftRecord || !edusoftRecord.enrolledInThesis) {
        newStatus = RegistrationStatus.NOT_ENROLLED_EDUSOFT;
        results.notEnrolled++;
      } else if (edusoftRecord.actualCredits < registration.creditsClaimed) {
        newStatus = RegistrationStatus.INVALID_CREDITS;
        creditsVerified = edusoftRecord.actualCredits;
        results.invalidCredits++;
      } else {
        newStatus = RegistrationStatus.VERIFIED;
        creditsVerified = edusoftRecord.actualCredits;
        results.verified++;
      }

      // Update registration with new status
      const updated = await this.prisma.registration.update({
        where: { id: registration.id },
        data: {
          status: newStatus,
          creditsVerified: creditsVerified,
          verifiedAt: new Date()
        },
        include: {
          student: true,
          topic: true
        }
      });

      // Send notification based on status
      if (newStatus !== RegistrationStatus.VERIFIED) {
        await this.notificationService.notifyInvalidRegistration(updated);
      }
    }

    // Step 4: Update batch record
    await this.prisma.verificationBatch.update({
      where: { id: batchId },
      data: {
        results: results
      }
    });

    // Step 5: Generate and send report
    await this.reportService.generateVerificationReport(batchId, results);
  }
}
```

### 3. Real-time Updates (WebSocket)
```typescript
// src/modules/registrations/registrations.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

@WebSocketGateway({
  namespace: 'registrations',
  cors: { origin: '*' }
})
export class RegistrationsGateway {
  constructor(private prisma: PrismaService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe-topic')
  async handleSubscribeTopic(
    @ConnectedSocket() client: Socket,
    @MessageBody() topicId: string
  ) {
    client.join(`topic-${topicId}`);

    // Send current slot availability
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId }
    });

    if (topic) {
      client.emit('slots-update', {
        topicId,
        available: topic.maxStudents - topic.currentStudents,
        total: topic.maxStudents
      });
    }
  }

  // Called when instructor accepts/denies
  notifyStatusChange(registration: any) {
    // Notify the specific student
    this.server.emit(`student-${registration.studentId}`, {
      type: 'status-change',
      registrationId: registration.id,
      newStatus: registration.status
    });

    // Update slot count for all subscribers
    if (registration.status === RegistrationStatus.INSTRUCTOR_ACCEPTED && registration.topic) {
      this.server.to(`topic-${registration.topicId}`).emit('slots-update', {
        topicId: registration.topicId,
        available: registration.topic.maxStudents - registration.topic.currentStudents,
        total: registration.topic.maxStudents
      });
    }
  }

  // Called when new application is submitted
  notifyNewApplication(registration: any) {
    // Notify instructor
    if (registration.topic && registration.topic.instructorId) {
      this.server.emit(`instructor-${registration.topic.instructorId}`, {
        type: 'new-application',
        registrationId: registration.id,
        studentName: registration.student.fullName,
        topicCode: registration.topic.topicCode
      });
    }
  }
}
```

## Configuration Files

### 1. Environment Variables (.env)
```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api
CORS_ORIGIN=http://localhost:3001

# Database - Prisma
DATABASE_URL="postgresql://thesis_admin:secure_password_here@localhost:5432/thesis_registration?schema=public"

# Redis (for Bull Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=30d

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=thesis-system@university.edu.vn
MAIL_PASSWORD=app-specific-password
MAIL_FROM="Thesis System <thesis-system@university.edu.vn>"

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg

# Registration Period
REGISTRATION_START_DATE=2024-02-01
REGISTRATION_END_DATE=2024-02-14
VERIFICATION_START_DATE=2024-02-15

# System Limits
MAX_APPLICATIONS_PER_STUDENT=3
MAX_STUDENTS_PER_INSTRUCTOR=10
SESSION_TIMEOUT=3600000
```

### 2. Main Application Bootstrap
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX', 'api'));
  
  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    credentials: true,
  });
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Thesis Registration System API')
    .setDescription('API for managing thesis topic registration')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
```

### 3. App Module Configuration
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TopicsModule } from './modules/topics/topics.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { VerificationModule } from './modules/verification/verification.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // Prisma Database Module (Global)
    PrismaModule,

    // Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Scheduler
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),

    // Mailer
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get('MAIL_FROM'),
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    TopicsModule,
    RegistrationsModule,
    VerificationModule,
    NotificationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
```

## Security Implementation

### 1. JWT Strategy
```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

### 2. Role-Based Guard
```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../database/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

## Error Handling

### Global Exception Filter
```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    });
  }
}
```

## Testing Requirements

### Unit Test Example
```typescript
// src/modules/registrations/registrations.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    registration: {
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'NotificationService',
          useValue: { notifyInstructor: jest.fn() },
        },
        {
          provide: 'RegistrationsGateway',
          useValue: { notifyNewApplication: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('applyForTopic', () => {
    it('should create a new registration', async () => {
      const applyDto = {
        topicId: 'topic-uuid',
        creditsClaimed: 120,
        transcriptUrl: 'path/to/file',
        motivationLetter: 'I am interested...',
      };

      const mockRegistration = {
        id: 'reg-uuid',
        studentId: 'student-id',
        topicId: 'topic-uuid',
        status: RegistrationStatus.PENDING_INSTRUCTOR_REVIEW,
        creditsClaimed: 120,
        student: { id: 'student-id', fullName: 'John Doe' },
        topic: { id: 'topic-uuid', topicCode: 'HK251-DCLV-001' },
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(null);
      mockPrismaService.registration.count.mockResolvedValue(1);
      mockPrismaService.registration.create.mockResolvedValue(mockRegistration);

      const result = await service.applyForTopic('student-id', applyDto);

      expect(prisma.registration.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.status).toBe(RegistrationStatus.PENDING_INSTRUCTOR_REVIEW);
    });

    it('should throw ConflictException if already applied', async () => {
      const applyDto = {
        topicId: 'topic-uuid',
        creditsClaimed: 120,
        transcriptUrl: 'path/to/file',
        motivationLetter: 'I am interested...',
      };

      mockPrismaService.registration.findUnique.mockResolvedValue({
        id: 'existing-reg',
      });

      await expect(
        service.applyForTopic('student-id', applyDto),
      ).rejects.toThrow('Already applied to this topic');
    });
  });
});
```

## Deployment Instructions

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: thesis_registration
      POSTGRES_USER: thesis_admin
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    depends_on:
      - postgres
      - redis
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

## Implementation Checklist

- [ ] Initialize NestJS project with TypeScript
- [ ] Install all required dependencies (including Prisma)
- [ ] Set up project structure as specified
- [ ] Initialize Prisma with PostgreSQL provider
- [ ] Create Prisma schema with all models and enums
- [ ] Generate Prisma Client and run initial migration
- [ ] Create PrismaService and PrismaModule
- [ ] Implement authentication module with JWT
- [ ] Create topics CRUD operations using Prisma
- [ ] Implement registration flow with status management
- [ ] Set up Bull queue for verification processing
- [ ] Implement WebSocket for real-time updates
- [ ] Create email notification service
- [ ] Add file upload handling for Excel and documents
- [ ] Implement role-based access control
- [ ] Set up Swagger documentation
- [ ] Add comprehensive error handling
- [ ] Create unit and integration tests
- [ ] Set up Docker configuration
- [ ] Add logging and monitoring
- [ ] Implement rate limiting
- [ ] Create Prisma migrations for schema changes
- [ ] Add input validation DTOs
- [ ] Create database seeding script
- [ ] Set up CI/CD pipeline

## Important Notes for Implementation

1. **Database Transactions**: Use Prisma transactions (`prisma.$transaction()`) for operations that modify multiple tables (e.g., accepting a registration and updating slot count)

2. **Concurrency Control**: Use Prisma's optimistic concurrency control with `@@map` and version fields for slot management to prevent race conditions

3. **File Security**: Validate and sanitize all uploaded files, store them outside the web root

4. **API Versioning**: Consider implementing API versioning from the start (/api/v1/)

5. **Audit Trail**: Log all critical operations (status changes, overrides) with timestamps and user IDs

6. **Backup Strategy**: Implement regular database backups before verification runs

7. **Performance**: Add database indexes in Prisma schema using `@@index` on frequently queried columns (userId, topicId, status)

8. **Monitoring**: Implement health checks endpoint for deployment monitoring

9. **Documentation**: Keep API documentation updated with Swagger decorators

10. **Testing**: Achieve minimum 80% code coverage with unit tests. Use Prisma's testing guide for mocking

11. **Migrations**: Always review generated Prisma migrations before applying to production

12. **Prisma Client**: Regenerate Prisma Client after schema changes with `npx prisma generate`

## Next Steps After Implementation

1. Set up staging environment for testing
2. Conduct security audit
3. Performance testing with expected load
4. User acceptance testing
5. Create admin dashboard
6. Set up monitoring and alerting
7. Prepare deployment documentation
8. Train department staff
9. Create user guides
10. Plan phased rollout strategy