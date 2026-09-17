import { PrismaClient, UserStatus, CourseStatus, AccessType, EnrollmentStatus, MaterialType, MaterialStatus, AnnouncementLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting มหาวิทยาลัย Xการช่าง Seed Initialization...');

  // 1. Create Roles (Student, Teacher, Approver, Director, Registrar)
  const roles = [
    { name: 'STUDENT', description: 'สิทธิ์นักศึกษา/นักเรียน สำหรับเข้าเรียนและเข้าชมสื่อ มหาวิทยาลัย Xการช่าง' },
    { name: 'PROFESSOR', description: 'สิทธิ์อาจารย์/ครูผู้สอน สำหรับจัดการรายวิชา อนุมัตินักเรียน ดูรายงานเข้าเรียนและความสนใจ' },
    { name: 'COURSE_CREATOR_APPROVER', description: 'สิทธิ์คนอนุมัติวิชา สำหรับพิจารณาคำขอเปิดรายวิชา' },
    { name: 'CONTENT_APPROVER', description: 'สิทธิ์คนอนุมัติสื่อ สำหรับตรวจสอบและกดอนุมัติสื่อการเรียนรู้' },
    { name: 'DIRECTOR', description: 'ผู้อำนวยการ (ผอ.) สำหรับดูภาพรวมการบริหาร 100% Read-Only' },
    { name: 'REGISTRAR', description: 'สิทธิ์นายทะเบียน/เจ้าหน้าที่ลงทะเบียน สำหรับแก้ไขและกำหนดสิทธิ์ผู้ใช้งาน แต่งตั้งอาจารย์และคนอนุมัติ' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roleMap[r.name] = createdRole.id;
  }

  // 2. System Settings for มหาวิทยาลัย Xการช่าง
  await prisma.systemSetting.upsert({
    where: { key: 'ALLOWED_EMAIL_DOMAINS' },
    update: { value: '@student.x-karchang.ac.th,@x-karchang.ac.th' },
    create: {
      key: 'ALLOWED_EMAIL_DOMAINS',
      value: '@student.x-karchang.ac.th,@x-karchang.ac.th',
      description: 'รายการโดเมนอีเมลของ มหาวิทยาลัย Xการช่าง ที่อนุญาตให้เข้าสู่ระบบ',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'UNIVERSITY_NAME' },
    update: { value: 'มหาวิทยาลัย Xการช่าง' },
    create: {
      key: 'UNIVERSITY_NAME',
      value: 'มหาวิทยาลัย Xการช่าง',
      description: 'ชื่อสถาบันการศึกษา',
    },
  });

  // 3. Create Users with Passwords for มหาวิทยาลัย Xการช่าง
  const defaultPassword = 'xkarchang2026';

  const usersData = [
    {
      email: 'student@student.x-karchang.ac.th',
      name: 'สมชาย ช่างกล (Somchai)',
      studentId: 'XK-65010042',
      department: 'ช่างกลโรงงาน & วิศวกรรมคอมพิวเตอร์',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'STUDENT',
    },
    {
      email: 'student2@student.x-karchang.ac.th',
      name: 'สมศักดิ์ ไฟฟ้า (Somsak)',
      studentId: 'XK-65010088',
      department: 'ช่างไฟฟ้ากำลัง',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'STUDENT',
    },
    {
      email: 'professor@x-karchang.ac.th',
      name: 'ผศ.ดร.วิชาญ สอนดี (Prof. Wichan)',
      studentId: null,
      department: 'ภาควิชาวิศวกรรมและเทคโนโลยี Xการช่าง',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'PROFESSOR',
    },
    {
      email: 'course.approver@x-karchang.ac.th',
      name: 'รศ.ดร.อนุมัติ วิชาการ (Course Approver)',
      studentId: null,
      department: 'ฝ่ายอนุมัติหลักสูตร มหาวิทยาลัย Xการช่าง',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'COURSE_CREATOR_APPROVER',
    },
    {
      email: 'content.approver@x-karchang.ac.th',
      name: 'ดร.ตรวจสอบ สื่อเรียน (Content Approver)',
      studentId: null,
      department: 'ศูนย์สื่อการเรียนรู้ Xการช่าง',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'CONTENT_APPROVER',
    },
    {
      email: 'director@x-karchang.ac.th',
      name: 'ผอ.ดร.บริหาร วิสัยทัศน์ (ผู้อำนวยการ มหาลัย Xการช่าง)',
      studentId: null,
      department: 'สำนักงานผู้อำนวยการ มหาวิทยาลัย Xการช่าง',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'DIRECTOR',
    },
    {
      email: 'registrar@x-karchang.ac.th',
      name: 'นายอนุมัติ ทะเบียนเรียน (Registrar)',
      studentId: 'REG-001',
      department: 'สำนักทะเบียนและประมวลผล มหาวิทยาลัย Xการช่าง',
      password: defaultPassword,
      status: UserStatus.ACTIVE,
      role: 'REGISTRAR',
    },
  ];

  const userMap: Record<string, string> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        status: u.status,
        department: u.department,
        studentId: u.studentId,
        password: u.password,
      },
      create: {
        email: u.email,
        name: u.name,
        studentId: u.studentId,
        department: u.department,
        password: u.password,
        status: u.status,
      },
    });
    userMap[u.email] = user.id;

    // Assign Primary Role
    const roleId = roleMap[u.role];
    if (roleId) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: roleId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: roleId,
        },
      });
    }

    // Every staff user also gets STUDENT role so they can enroll & learn courses
    if (u.role !== 'STUDENT' && roleMap['STUDENT']) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: roleMap['STUDENT'],
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: roleMap['STUDENT'],
        },
      });
    }
  }

  const profId = userMap['professor@x-karchang.ac.th'];
  const student1Id = userMap['student@student.x-karchang.ac.th'];
  const student2Id = userMap['student2@student.x-karchang.ac.th'];
  const directorId = userMap['director@x-karchang.ac.th'];

  // 4. Create Courses for มหาวิทยาลัย Xการช่าง
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: { accessType: AccessType.OPEN },
    create: {
      code: 'CS101',
      title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)',
      description: 'เรียนรู้พื้นฐานการเขียนโปรแกรม โครงสร้างข้อมูล และอัลกอริทึม สำหรับช่างเทคโนโลยี มหาวิทยาลัย Xการช่าง',
      category: 'วิศวกรรมคอมพิวเตอร์',
      semester: '1',
      academicYear: '2026',
      status: CourseStatus.PUBLISHED,
      accessType: AccessType.OPEN,
      storageLimitGb: 10.0,
      createdById: profId,
    },
  });

  await prisma.courseInstructor.upsert({
    where: {
      courseId_instructorId: {
        courseId: course1.id,
        instructorId: profId,
      },
    },
    update: {},
    create: {
      courseId: course1.id,
      instructorId: profId,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'ME201' },
    update: { accessType: AccessType.APPROVAL_REQUIRED },
    create: {
      code: 'ME201',
      title: 'กลศาสตร์เครื่องกลและการออกแบบระบบอัตโนมัติ (Automotive Mechanics)',
      description: 'เทคนิคการออกแบบชิ้นส่วนเครื่องกล ระบบไฮดรอลิก และระบบควบคุมอัตโนมัติในงานช่าง',
      category: 'ช่างกลโรงงาน',
      semester: '1',
      academicYear: '2026',
      status: CourseStatus.PUBLISHED,
      accessType: AccessType.APPROVAL_REQUIRED,
      storageLimitGb: 15.0,
      createdById: profId,
    },
  });

  await prisma.courseInstructor.upsert({
    where: {
      courseId_instructorId: {
        courseId: course2.id,
        instructorId: profId,
      },
    },
    update: {},
    create: {
      courseId: course2.id,
      instructorId: profId,
    },
  });

  const coursePending = await prisma.course.upsert({
    where: { code: 'EE305' },
    update: {},
    create: {
      code: 'EE305',
      title: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT (Industrial Electrical Control & IoT)',
      description: 'โครงสร้างวิชาใหม่ที่รอการตรวจสอบอนุมัติเปิดสอนจากคนอนุมัติ มหาวิทยาลัย Xการช่าง',
      category: 'ช่างไฟฟ้ากำลัง',
      semester: '2',
      academicYear: '2026',
      status: CourseStatus.PENDING_APPROVAL,
      accessType: AccessType.APPROVAL_REQUIRED,
      storageLimitGb: 20.0,
      createdById: profId,
    },
  });

  // 5. Create Enrollments
  await prisma.courseEnrollment.upsert({
    where: {
      courseId_studentId: {
        courseId: course1.id,
        studentId: student1Id,
      },
    },
    update: { status: EnrollmentStatus.APPROVED },
    create: {
      courseId: course1.id,
      studentId: student1Id,
      status: EnrollmentStatus.APPROVED,
      approvedById: profId,
      approvedAt: new Date(),
    },
  });

  await prisma.courseEnrollment.upsert({
    where: {
      courseId_studentId: {
        courseId: course2.id,
        studentId: student2Id,
      },
    },
    update: { status: EnrollmentStatus.PENDING },
    create: {
      courseId: course2.id,
      studentId: student2Id,
      status: EnrollmentStatus.PENDING,
    },
  });

  // 6. Seed Class Attendance Records (ใครเข้าเรียนคลาสนี้)
  const dates = ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-08', '2026-09-10'];
  for (const date of dates) {
    await prisma.attendance.upsert({
      where: {
        courseId_studentId_date: {
          courseId: course1.id,
          studentId: student1Id,
          date,
        },
      },
      update: {},
      create: {
        courseId: course1.id,
        studentId: student1Id,
        date,
        status: date === '2026-09-05' ? 'LATE' : 'PRESENT',
        checkInTime: date === '2026-09-05' ? '09:18:22' : '08:55:10',
        sessionTopic: `ปฏิบัติการบทเรียนวันที่ ${date}`,
      },
    });
  }

  // 7. Seed Learning Materials & Access Logs
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course1.id,
        title: 'ปฏิบัติการที่ 1: การติดตั้งเครื่องมือช่างและสภาพแวดล้อมระบบ',
        description: 'วิดีโอสาธิตขั้นตอนปฏิบัติการพร้อมแบบทดลองความเข้าใจ',
        type: MaterialType.VIDEO,
        filePath: 'materials/x_karchang_lab1.mp4',
        fileSize: BigInt(450000000),
        mimeType: 'video/mp4',
        duration: 3200,
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course2.id,
        title: 'คู่มือความปลอดภัยและการบำรุงรักษาเครื่องจักร Xการช่าง (PDF)',
        description: 'คู่มือมาตรฐานความปลอดภัยประจำห้องปฏิบัติการ มหาวิทยาลัย Xการช่าง',
        type: MaterialType.PDF,
        filePath: 'materials/safety_manual_xk.pdf',
        fileSize: BigInt(22000000),
        mimeType: 'application/pdf',
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
    ],
  });

  // 8. Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'ยินดีต้อนรับสู่ระบบเรียนรู้ออนไลน์ มหาวิทยาลัย Xการช่าง',
        content: 'ระบบสารสนเทศการเรียนรู้ออนไลน์ เปิดให้บริการเข้าเรียนและติดตามสถิติการเรียนสำหรับสถาบัน',
        level: AnnouncementLevel.SYSTEM,
        createdById: directorId,
        status: 'PUBLISHED',
      },
      {
        title: 'เช็คชื่อเข้าเรียนและการส่งรายงานภาคปฏิบัติวิชา CS101',
        content: 'นักศึกษา มหาวิทยาลัย Xการช่าง ทุกท่าน สามารถตรวจสอบประวัติการเข้าเรียน (Attendance) ได้ที่หน้าระบบของตนเอง',
        level: AnnouncementLevel.COURSE,
        courseId: course1.id,
        createdById: profId,
        status: 'PUBLISHED',
      },
    ],
  });

  // 9. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1Id,
        title: 'เช็คชื่อเข้าเรียนสำเร็จ',
        message: 'ระบบบันทึกเวลาเข้าเรียนตรงเวลาในวิชา CS101 ประจำวันเรียบร้อยแล้ว',
        link: `/student`,
        type: 'SUCCESS',
      },
      {
        userId: profId,
        title: 'มีคำขอเข้าเรียนใหม่ วิชา ME201',
        message: 'สมศักดิ์ ไฟฟ้า ได้ส่งคำขอเข้าร่วมรายวิชา ME201 กรุณาพิจารณาอนุมัติ',
        link: `/professor`,
        type: 'INFO',
      },
    ],
  });

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: directorId,
      action: 'UNIVERSITY_INITIALIZED',
      resource: 'DATABASE',
      metadata: JSON.stringify({ message: 'มหาวิทยาลัย Xการช่าง LMS Dataset Seeded Successfully' }),
    },
  });

  console.log('✅ มหาวิทยาลัย Xการช่าง Seed Completed (Strictly 4 Roles: Student, Teacher, Approver, Director)!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
