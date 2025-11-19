import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicFilterDto } from './dto/topic-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async create(instructorId: string, createTopicDto: CreateTopicDto) {
    // Check if topic code already exists
    const existingTopic = await this.prisma.topic.findUnique({
      where: { topicCode: createTopicDto.topicCode },
    });

    if (existingTopic) {
      throw new ConflictException('Topic code already exists');
    }

    return this.prisma.topic.create({
      data: {
        ...createTopicDto,
        instructorId,
        currentStudents: 0,
      },
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
    });
  }

  async findAll(filterDto: TopicFilterDto) {
    const { page, limit, semester, topicType, status, department, search, programType } = filterDto;

    const where: Prisma.TopicWhereInput = {};

    if (semester) {
      where.semester = semester;
    }

    if (topicType) {
      where.topicType = topicType;
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (programType) {
      where.programTypes = {
        has: programType,
      };
    }

    if (search) {
      where.OR = [
        { titleVn: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [topics, total] = await Promise.all([
      this.prisma.topic.findMany({
        where,
        skip: filterDto.skip,
        take: limit,
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
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.topic.count({ where }),
    ]);

    return {
      data: topics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
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
        registrations: {
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
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async findByInstructor(instructorId: string) {
    return this.prisma.topic.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, instructorId: string, updateTopicDto: UpdateTopicDto) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Check if the instructor owns this topic
    if (topic.instructorId !== instructorId) {
      throw new ForbiddenException('You can only update your own topics');
    }

    // If updating topic code, check for conflicts
    if (updateTopicDto.topicCode && updateTopicDto.topicCode !== topic.topicCode) {
      const existingTopic = await this.prisma.topic.findUnique({
        where: { topicCode: updateTopicDto.topicCode },
      });

      if (existingTopic) {
        throw new ConflictException('Topic code already exists');
      }
    }

    return this.prisma.topic.update({
      where: { id },
      data: updateTopicDto,
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
    });
  }

  async remove(id: string, instructorId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Check if the instructor owns this topic
    if (topic.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own topics');
    }

    // Prevent deletion if there are registrations
    if (topic._count.registrations > 0) {
      throw new ForbiddenException(
        'Cannot delete topic with existing registrations',
      );
    }

    await this.prisma.topic.delete({
      where: { id },
    });

    return { message: 'Topic deleted successfully' };
  }
}
