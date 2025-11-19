import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus, TopicStatus } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      totalTopics,
      activeTopics,
      fullTopics,
      totalRegistrations,
      pendingRegistrations,
      acceptedRegistrations,
      verifiedRegistrations,
      totalStudents,
      totalInstructors,
    ] = await Promise.all([
      this.prisma.topic.count(),
      this.prisma.topic.count({ where: { status: TopicStatus.ACTIVE } }),
      this.prisma.topic.count({ where: { status: TopicStatus.FULL } }),
      this.prisma.registration.count(),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.PENDING_INSTRUCTOR_REVIEW },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.INSTRUCTOR_ACCEPTED },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.VERIFIED },
      }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
    ]);

    return {
      topics: {
        total: totalTopics,
        active: activeTopics,
        full: fullTopics,
      },
      registrations: {
        total: totalRegistrations,
        pending: pendingRegistrations,
        accepted: acceptedRegistrations,
        verified: verifiedRegistrations,
      },
      users: {
        students: totalStudents,
        instructors: totalInstructors,
      },
    };
  }

  async getInstructorLoad() {
    const instructors = await this.prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        department: true,
        topics: {
          select: {
            id: true,
            topicCode: true,
            titleVn: true,
            maxStudents: true,
            currentStudents: true,
            status: true,
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        },
      },
    });

    return instructors.map((instructor) => ({
      instructor: {
        id: instructor.id,
        userId: instructor.userId,
        fullName: instructor.fullName,
        email: instructor.email,
        department: instructor.department,
      },
      topicsCount: instructor.topics.length,
      totalSlots: instructor.topics.reduce((sum, t) => sum + t.maxStudents, 0),
      occupiedSlots: instructor.topics.reduce(
        (sum, t) => sum + t.currentStudents,
        0,
      ),
      totalApplications: instructor.topics.reduce(
        (sum, t) => sum + t._count.registrations,
        0,
      ),
      topics: instructor.topics,
    }));
  }

  async getDepartmentStats(department?: string) {
    const where = department ? { department } : {};

    const [
      topicsByDepartment,
      registrationsByStatus,
      topicsByType,
    ] = await Promise.all([
      this.prisma.topic.groupBy({
        by: ['department'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          maxStudents: true,
          currentStudents: true,
        },
      }),
      this.prisma.registration.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      this.prisma.topic.groupBy({
        by: ['topicType'],
        where,
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      departmentStats: topicsByDepartment.map((dept) => ({
        department: dept.department,
        topicsCount: dept._count.id,
        totalSlots: dept._sum.maxStudents || 0,
        occupiedSlots: dept._sum.currentStudents || 0,
        availableSlots:
          (dept._sum.maxStudents || 0) - (dept._sum.currentStudents || 0),
      })),
      statusDistribution: registrationsByStatus.map((status) => ({
        status: status.status,
        count: status._count.id,
      })),
      topicTypeDistribution: topicsByType.map((type) => ({
        type: type.topicType,
        count: type._count.id,
      })),
    };
  }

  async exportToExcel(type: 'topics' | 'registrations' | 'instructor-load') {
    const workbook = new ExcelJS.Workbook();

    if (type === 'topics') {
      const topics = await this.prisma.topic.findMany({
        include: {
          instructor: {
            select: {
              userId: true,
              fullName: true,
              department: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      });

      const worksheet = workbook.addWorksheet('Topics');
      worksheet.columns = [
        { header: 'Topic Code', key: 'topicCode', width: 20 },
        { header: 'Semester', key: 'semester', width: 15 },
        { header: 'Type', key: 'topicType', width: 15 },
        { header: 'Title (VN)', key: 'titleVn', width: 40 },
        { header: 'Instructor', key: 'instructor', width: 25 },
        { header: 'Department', key: 'department', width: 25 },
        { header: 'Max Students', key: 'maxStudents', width: 15 },
        { header: 'Current Students', key: 'currentStudents', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Applications', key: 'applications', width: 15 },
      ];

      topics.forEach((topic) => {
        worksheet.addRow({
          topicCode: topic.topicCode,
          semester: topic.semester,
          topicType: topic.topicType,
          titleVn: topic.titleVn,
          instructor: topic.instructor.fullName,
          department: topic.department,
          maxStudents: topic.maxStudents,
          currentStudents: topic.currentStudents,
          status: topic.status,
          applications: topic._count.registrations,
        });
      });
    } else if (type === 'registrations') {
      const registrations = await this.prisma.registration.findMany({
        include: {
          student: {
            select: {
              userId: true,
              fullName: true,
              email: true,
              program: true,
            },
          },
          topic: {
            select: {
              topicCode: true,
              titleVn: true,
              instructor: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      });

      const worksheet = workbook.addWorksheet('Registrations');
      worksheet.columns = [
        { header: 'Student ID', key: 'studentId', width: 15 },
        { header: 'Student Name', key: 'studentName', width: 25 },
        { header: 'Program', key: 'program', width: 15 },
        { header: 'Topic Code', key: 'topicCode', width: 20 },
        { header: 'Topic Title', key: 'topicTitle', width: 40 },
        { header: 'Instructor', key: 'instructor', width: 25 },
        { header: 'Status', key: 'status', width: 25 },
        { header: 'Credits Claimed', key: 'creditsClaimed', width: 15 },
        { header: 'Credits Verified', key: 'creditsVerified', width: 15 },
        { header: 'Applied Date', key: 'appliedDate', width: 20 },
      ];

      registrations.forEach((reg) => {
        worksheet.addRow({
          studentId: reg.student.userId,
          studentName: reg.student.fullName,
          program: reg.student.program,
          topicCode: reg.topic.topicCode,
          topicTitle: reg.topic.titleVn,
          instructor: reg.topic.instructor.fullName,
          status: reg.status,
          creditsClaimed: reg.creditsClaimed,
          creditsVerified: reg.creditsVerified,
          appliedDate: reg.createdAt,
        });
      });
    } else if (type === 'instructor-load') {
      const instructorLoad = await this.getInstructorLoad();

      const worksheet = workbook.addWorksheet('Instructor Load');
      worksheet.columns = [
        { header: 'Instructor ID', key: 'instructorId', width: 15 },
        { header: 'Instructor Name', key: 'instructorName', width: 25 },
        { header: 'Department', key: 'department', width: 25 },
        { header: 'Topics Count', key: 'topicsCount', width: 15 },
        { header: 'Total Slots', key: 'totalSlots', width: 15 },
        { header: 'Occupied Slots', key: 'occupiedSlots', width: 15 },
        { header: 'Available Slots', key: 'availableSlots', width: 15 },
        { header: 'Total Applications', key: 'totalApplications', width: 15 },
      ];

      instructorLoad.forEach((load) => {
        worksheet.addRow({
          instructorId: load.instructor.userId,
          instructorName: load.instructor.fullName,
          department: load.instructor.department,
          topicsCount: load.topicsCount,
          totalSlots: load.totalSlots,
          occupiedSlots: load.occupiedSlots,
          availableSlots: load.totalSlots - load.occupiedSlots,
          totalApplications: load.totalApplications,
        });
      });
    }

    return workbook;
  }
}
