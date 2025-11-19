// prisma/seed.ts
import { PrismaClient, UserRole, TopicType, TopicStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

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
  console.log('Created admin user:', admin.email);

  // Create department user
  const deptPassword = await bcrypt.hash('dept123', 10);
  const dept = await prisma.user.upsert({
    where: { email: 'department@university.edu.vn' },
    update: {},
    create: {
      userId: 'DEPT001',
      fullName: 'Department Staff',
      email: 'department@university.edu.vn',
      password: deptPassword,
      role: UserRole.DEPARTMENT,
      department: 'Computer Science',
    },
  });
  console.log('Created department user:', dept.email);

  // Create instructor users
  const instructor1Password = await bcrypt.hash('instructor123', 10);
  const instructor1 = await prisma.user.upsert({
    where: { email: 'instructor1@university.edu.vn' },
    update: {},
    create: {
      userId: 'INST001',
      fullName: 'TS. Nguyen Van A',
      email: 'instructor1@university.edu.vn',
      password: instructor1Password,
      role: UserRole.INSTRUCTOR,
      department: 'Computer Science',
    },
  });
  console.log('Created instructor 1:', instructor1.email);

  const instructor2Password = await bcrypt.hash('instructor123', 10);
  const instructor2 = await prisma.user.upsert({
    where: { email: 'instructor2@university.edu.vn' },
    update: {},
    create: {
      userId: 'INST002',
      fullName: 'PGS. Tran Thi B',
      email: 'instructor2@university.edu.vn',
      password: instructor2Password,
      role: UserRole.INSTRUCTOR,
      department: 'Computer Science',
    },
  });
  console.log('Created instructor 2:', instructor2.email);

  // Create student users
  const student1Password = await bcrypt.hash('student123', 10);
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@student.hcmiu.edu.vn' },
    update: {},
    create: {
      userId: 'ITITIU19001',
      fullName: 'Le Van C',
      email: 'student1@student.hcmiu.edu.vn',
      password: student1Password,
      role: UserRole.STUDENT,
      department: 'Computer Science',
      major: 'Information Technology',
      program: 'CQ',
    },
  });
  console.log('Created student 1:', student1.email);

  const student2Password = await bcrypt.hash('student123', 10);
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@student.hcmiu.edu.vn' },
    update: {},
    create: {
      userId: 'ITITIU19002',
      fullName: 'Pham Thi D',
      email: 'student2@student.hcmiu.edu.vn',
      password: student2Password,
      role: UserRole.STUDENT,
      department: 'Computer Science',
      major: 'Information Technology',
      program: 'CN',
    },
  });
  console.log('Created student 2:', student2.email);

  // Create sample topics
  const topic1 = await prisma.topic.upsert({
    where: { topicCode: 'HK251-DCLV-001' },
    update: {},
    create: {
      topicCode: 'HK251-DCLV-001',
      semester: 'HK251',
      topicType: TopicType.DCLV,
      titleVn: 'Hệ thống quản lý đăng ký đề tài luận văn',
      titleEn: 'Thesis Registration Management System',
      description:
        'Xây dựng hệ thống web quản lý đăng ký đề tài luận văn tốt nghiệp cho sinh viên, bao gồm đăng ký, phê duyệt và xác thực.',
      phase1Requirements:
        'Hoàn thành tài liệu đề cương, phân tích yêu cầu hệ thống',
      phase2Requirements: 'Triển khai hệ thống và kiểm thử đầy đủ',
      maxStudents: 2,
      currentStudents: 0,
      programTypes: ['CQ', 'CN'],
      prerequisites: 'Hoàn thành ít nhất 100 tín chỉ',
      status: TopicStatus.ACTIVE,
      department: 'Computer Science',
      instructorId: instructor1.id,
      references: [
        {
          text: 'NestJS Documentation',
          url: 'https://docs.nestjs.com',
        },
        {
          text: 'Prisma Documentation',
          url: 'https://www.prisma.io/docs',
        },
      ],
    },
  });
  console.log('Created topic 1:', topic1.topicCode);

  const topic2 = await prisma.topic.upsert({
    where: { topicCode: 'HK251-LVTN-002' },
    update: {},
    create: {
      topicCode: 'HK251-LVTN-002',
      semester: 'HK251',
      topicType: TopicType.LVTN,
      titleVn: 'Ứng dụng AI trong phân tích dữ liệu y tế',
      titleEn: 'AI Application in Healthcare Data Analysis',
      description:
        'Nghiên cứu và ứng dụng các kỹ thuật machine learning để phân tích dữ liệu y tế và hỗ trợ chẩn đoán.',
      phase1Requirements: 'Nghiên cứu các thuật toán ML phù hợp',
      phase2Requirements: 'Triển khai và đánh giá mô hình',
      maxStudents: 1,
      currentStudents: 0,
      programTypes: ['CQ'],
      prerequisites: 'Hoàn thành môn Machine Learning',
      status: TopicStatus.ACTIVE,
      department: 'Computer Science',
      instructorId: instructor2.id,
      references: [
        {
          text: 'TensorFlow Documentation',
          url: 'https://www.tensorflow.org',
        },
      ],
    },
  });
  console.log('Created topic 2:', topic2.topicCode);

  const topic3 = await prisma.topic.upsert({
    where: { topicCode: 'HK251-DATN-003' },
    update: {},
    create: {
      topicCode: 'HK251-DATN-003',
      semester: 'HK251',
      topicType: TopicType.DATN,
      titleVn: 'Hệ thống IoT giám sát môi trường',
      titleEn: 'IoT-based Environmental Monitoring System',
      description:
        'Thiết kế và triển khai hệ thống IoT để giám sát các thông số môi trường như nhiệt độ, độ ẩm, chất lượng không khí.',
      phase1Requirements: 'Thiết kế kiến trúc hệ thống IoT',
      phase2Requirements: 'Lắp đặt và kiểm thử hệ thống thực tế',
      maxStudents: 2,
      currentStudents: 0,
      programTypes: ['CN', 'B2'],
      prerequisites: 'Hoàn thành môn IoT và Embedded Systems',
      status: TopicStatus.ACTIVE,
      department: 'Computer Science',
      instructorId: instructor1.id,
    },
  });
  console.log('Created topic 3:', topic3.topicCode);

  console.log('Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('Admin: admin@university.edu.vn / admin123');
  console.log('Department: department@university.edu.vn / dept123');
  console.log('Instructor 1: instructor1@university.edu.vn / instructor123');
  console.log('Instructor 2: instructor2@university.edu.vn / instructor123');
  console.log('Student 1: student1@student.hcmiu.edu.vn / student123');
  console.log('Student 2: student2@student.hcmiu.edu.vn / student123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
