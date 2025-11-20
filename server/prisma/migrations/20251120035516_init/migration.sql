-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR', 'DEPARTMENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "TopicType" AS ENUM ('DCLV', 'DACN', 'DAMHKTMT', 'LVTN', 'DATN');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FULL');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_INSTRUCTOR_REVIEW', 'INSTRUCTOR_ACCEPTED', 'INSTRUCTOR_DENIED', 'VERIFIED', 'INVALID_CREDITS', 'NOT_ENROLLED_EDUSOFT', 'DEPARTMENT_REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "department" TEXT,
    "major" TEXT,
    "program" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "topicCode" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "topicType" "TopicType" NOT NULL,
    "titleVn" TEXT NOT NULL,
    "titleEn" TEXT,
    "description" TEXT NOT NULL,
    "phase1Requirements" TEXT,
    "phase2Requirements" TEXT,
    "maxStudents" INTEGER NOT NULL DEFAULT 1,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "programTypes" TEXT[],
    "prerequisites" TEXT,
    "references" JSONB,
    "status" "TopicStatus" NOT NULL DEFAULT 'ACTIVE',
    "department" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_INSTRUCTOR_REVIEW',
    "creditsClaimed" INTEGER,
    "creditsVerified" INTEGER,
    "transcriptUrl" TEXT,
    "motivationLetter" TEXT,
    "instructorComment" TEXT,
    "departmentComment" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_batches" (
    "id" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "errors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topics_topicCode_key" ON "topics"("topicCode");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_studentId_topicId_key" ON "registrations"("studentId", "topicId");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
