import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AppConfigService } from '../../shared/services/config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplyTopicDto } from './dto/apply-topic.dto';
import { ReviewApplicationDto, ReviewDecision } from './dto/review-application.dto';
import { RegistrationFilterDto } from './dto/registration-filter.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationStatus, TopicStatus } from '@prisma/client';
import { RegistrationsGateway } from './registrations.gateway';

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private configService: AppConfigService,
    private registrationsGateway: RegistrationsGateway,
  ) {}

  private isRegistrationOpen(): boolean {
    const now = new Date();
    const startDate = new Date(
      this.configService.appConfig.registrationStartDate,
    );
    const endDate = new Date(this.configService.appConfig.registrationEndDate);
    return now >= startDate && now <= endDate;
  }

  async applyForTopic(studentId: string, applyDto: ApplyTopicDto) {
    // Step 1: Check if registration period is open
    if (!this.isRegistrationOpen()) {
      throw new BadRequestException('Registration period is closed');
    }

    // Step 2: Check if topic exists and is active
    const topic = await this.prisma.topic.findUnique({
      where: { id: applyDto.topicId },
      include: {
        instructor: true,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.status !== TopicStatus.ACTIVE) {
      throw new BadRequestException('Topic is not available for registration');
    }

    if (topic.currentStudents >= topic.maxStudents) {
      throw new BadRequestException('Topic is full');
    }

    // Step 3: Check if student already applied to this topic
    const existingApplication = await this.prisma.registration.findUnique({
      where: {
        studentId_topicId: {
          studentId: studentId,
          topicId: applyDto.topicId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Already applied to this topic');
    }

    // Step 4: Check maximum applications limit
    const maxApplications = this.configService.appConfig.maxApplicationsPerStudent;
    const applicationCount = await this.prisma.registration.count({
      where: {
        studentId: studentId,
        status: {
          notIn: [
            RegistrationStatus.INSTRUCTOR_DENIED,
            RegistrationStatus.DEPARTMENT_REVOKED,
          ],
        },
      },
    });

    if (applicationCount >= maxApplications) {
      throw new BadRequestException(
        `Maximum application limit (${maxApplications}) reached`,
      );
    }

    // Step 5: Create registration
    const registration = await this.prisma.registration.create({
      data: {
        studentId: studentId,
        topicId: applyDto.topicId,
        creditsClaimed: applyDto.creditsClaimed,
        transcriptUrl: applyDto.transcriptUrl,
        motivationLetter: applyDto.motivationLetter,
        status: RegistrationStatus.PENDING_INSTRUCTOR_REVIEW,
      },
      include: {
        student: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            program: true,
          },
        },
        topic: {
          include: {
            instructor: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Step 6: Send notifications
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
            instructor: true,
          },
        },
        student: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            program: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
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
      if (reviewDto.decision === ReviewDecision.ACCEPT) {
        // Check if topic is full
        const topic = await prisma.topic.findUnique({
          where: { id: registration.topicId },
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
            instructorComment: reviewDto.comment,
          },
          include: {
            student: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                email: true,
                program: true,
              },
            },
            topic: true,
          },
        });

        // Increment topic slot count
        await prisma.topic.update({
          where: { id: registration.topicId },
          data: {
            currentStudents: {
              increment: 1,
            },
            // Set to FULL if all slots are taken
            status:
              topic.currentStudents + 1 >= topic.maxStudents
                ? TopicStatus.FULL
                : topic.status,
          },
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
            instructorComment: reviewDto.comment,
          },
          include: {
            student: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                email: true,
                program: true,
              },
            },
            topic: true,
          },
        });
      }
    });

    // Step 4: Send notifications
    this.registrationsGateway.notifyStatusChange(updated);

    return updated;
  }

  async getMyApplications(studentId: string, filterDto?: RegistrationFilterDto) {
    const where: any = { studentId };

    if (filterDto?.status) {
      where.status = filterDto.status;
    }

    return this.prisma.registration.findMany({
      where,
      include: {
        topic: {
          include: {
            instructor: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPendingReviews(instructorId: string) {
    return this.prisma.registration.findMany({
      where: {
        topic: {
          instructorId,
        },
        status: RegistrationStatus.PENDING_INSTRUCTOR_REVIEW,
      },
      include: {
        student: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            program: true,
            major: true,
          },
        },
        topic: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getMyStudents(instructorId: string) {
    return this.prisma.registration.findMany({
      where: {
        topic: {
          instructorId,
        },
        status: {
          in: [RegistrationStatus.INSTRUCTOR_ACCEPTED, RegistrationStatus.VERIFIED],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            program: true,
            major: true,
          },
        },
        topic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async withdrawApplication(studentId: string, registrationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.studentId !== studentId) {
      throw new ForbiddenException('Not authorized to withdraw this application');
    }

    // Can only withdraw if pending or denied
    if (
      registration.status !== RegistrationStatus.PENDING_INSTRUCTOR_REVIEW &&
      registration.status !== RegistrationStatus.INSTRUCTOR_DENIED
    ) {
      throw new BadRequestException('Cannot withdraw this application');
    }

    await this.prisma.registration.delete({
      where: { id: registrationId },
    });

    return { message: 'Application withdrawn successfully' };
  }

  async updateApplication(
    studentId: string,
    registrationId: string,
    updateDto: UpdateRegistrationDto,
  ) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.studentId !== studentId) {
      throw new ForbiddenException('Not authorized to update this application');
    }

    // Can only update if pending
    if (registration.status !== RegistrationStatus.PENDING_INSTRUCTOR_REVIEW) {
      throw new BadRequestException('Cannot update this application');
    }

    return this.prisma.registration.update({
      where: { id: registrationId },
      data: updateDto,
      include: {
        topic: {
          include: {
            instructor: {
              select: {
                id: true,
                userId: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllRegistrations(filterDto?: RegistrationFilterDto) {
    const where: any = {};

    if (filterDto?.status) {
      where.status = filterDto.status;
    } else {
      // By default, only show registrations that have been processed by instructors
      // Department admin should only see accepted registrations and their verification results
      // Exclude PENDING_INSTRUCTOR_REVIEW and INSTRUCTOR_DENIED
      where.status = {
        in: [
          RegistrationStatus.INSTRUCTOR_ACCEPTED,
          RegistrationStatus.VERIFIED,
          RegistrationStatus.INVALID_CREDITS,
          RegistrationStatus.NOT_ENROLLED_EDUSOFT,
          RegistrationStatus.DEPARTMENT_REVOKED,
        ],
      };
    }

    const [registrations, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        skip: filterDto?.skip,
        take: filterDto?.limit,
        include: {
          student: {
            select: {
              id: true,
              userId: true,
              fullName: true,
              email: true,
              program: true,
              major: true,
            },
          },
          topic: {
            include: {
              instructor: {
                select: {
                  id: true,
                  userId: true,
                  fullName: true,
                  email: true,
                  department: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return {
      data: registrations,
      meta: {
        total,
        page: filterDto?.page || 1,
        limit: filterDto?.limit || 10,
        totalPages: Math.ceil(total / (filterDto?.limit || 10)),
      },
    };
  }
}
