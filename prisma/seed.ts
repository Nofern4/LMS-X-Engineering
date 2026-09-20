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
  // ─── CS101: วิดีโอ + เอกสาร + แบบทดสอบ ───────────────────────────────────
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: { accessType: AccessType.OPEN, status: CourseStatus.PUBLISHED },
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
    where: { courseId_instructorId: { courseId: course1.id, instructorId: profId } },
    update: {},
    create: { courseId: course1.id, instructorId: profId },
  });

  // ─── ME201: เอกสารอย่างเดียว ไม่มีวิดีโอ ไม่มีแบบทดสอบ ────────────────────
  const course2 = await prisma.course.upsert({
    where: { code: 'ME201' },
    update: { accessType: AccessType.APPROVAL_REQUIRED, status: CourseStatus.PUBLISHED },
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
    where: { courseId_instructorId: { courseId: course2.id, instructorId: profId } },
    update: {},
    create: { courseId: course2.id, instructorId: profId },
  });

  // ─── EE305: วิดีโอ + เอกสาร + แบบทดสอบ (PENDING_APPROVAL) ─────────────────
  const course3 = await prisma.course.upsert({
    where: { code: 'EE305' },
    update: {},
    create: {
      code: 'EE305',
      title: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT (Industrial Electrical Control & IoT)',
      description: 'ระบบควบคุมมอเตอร์ไฟฟ้า Relay, PLC และการประยุกต์ใช้ IoT ในโรงงานอุตสาหกรรม',
      category: 'ช่างไฟฟ้ากำลัง',
      semester: '2',
      academicYear: '2026',
      status: CourseStatus.PENDING_APPROVAL,
      accessType: AccessType.APPROVAL_REQUIRED,
      storageLimitGb: 20.0,
      createdById: profId,
    },
  });

  await prisma.courseInstructor.upsert({
    where: { courseId_instructorId: { courseId: course3.id, instructorId: profId } },
    update: {},
    create: { courseId: course3.id, instructorId: profId },
  });

  // ─── SE302: วิดีโอ + แบบทดสอบ ไม่มีเอกสาร ──────────────────────────────────
  const course4 = await prisma.course.upsert({
    where: { code: 'SE302' },
    update: {},
    create: {
      code: 'SE302',
      title: 'วิศวกรรมซอฟต์แวร์ขั้นสูงและสถาปัตยกรรมระบบ (Advanced Software Engineering)',
      description: 'Clean Architecture, Microservices, Design Patterns และการออกแบบระบบขนาดใหญ่สำหรับวิศวกรซอฟต์แวร์มืออาชีพ',
      category: 'วิศวกรรมซอฟต์แวร์',
      semester: '1',
      academicYear: '2026',
      status: CourseStatus.PUBLISHED,
      accessType: AccessType.OPEN,
      storageLimitGb: 15.0,
      createdById: profId,
    },
  });

  await prisma.courseInstructor.upsert({
    where: { courseId_instructorId: { courseId: course4.id, instructorId: profId } },
    update: {},
    create: { courseId: course4.id, instructorId: profId },
  });

  // ─── AI401: วิดีโอ + เอกสาร + แบบทดสอบ ─────────────────────────────────────
  const course5 = await prisma.course.upsert({
    where: { code: 'AI401' },
    update: {},
    create: {
      code: 'AI401',
      title: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง (Artificial Intelligence & Machine Learning)',
      description: 'หลักการ ML, Deep Learning, Neural Networks และการประยุกต์ใช้ AI ในงานอุตสาหกรรมและวิศวกรรม',
      category: 'วิทยาการข้อมูล',
      semester: '2',
      academicYear: '2026',
      status: CourseStatus.PUBLISHED,
      accessType: AccessType.OPEN,
      storageLimitGb: 20.0,
      createdById: profId,
    },
  });

  await prisma.courseInstructor.upsert({
    where: { courseId_instructorId: { courseId: course5.id, instructorId: profId } },
    update: {},
    create: { courseId: course5.id, instructorId: profId },
  });

  // ─── AUTO101: วิดีโอ + เอกสาร ไม่มีแบบทดสอบ ────────────────────────────────
  const course6 = await prisma.course.upsert({
    where: { code: 'AUTO101' },
    update: {},
    create: {
      code: 'AUTO101',
      title: 'เทคโนโลยีช่างยนต์และระบบส่งกำลัง (Automotive Technology)',
      description: 'เทคโนโลยียานยนต์สมัยใหม่ ระบบส่งกำลัง เครื่องยนต์สันดาป และระบบยานยนต์ไฟฟ้า (EV)',
      category: 'เทคโนโลยีช่างยนต์',
      semester: '1',
      academicYear: '2026',
      status: CourseStatus.PUBLISHED,
      accessType: AccessType.OPEN,
      storageLimitGb: 15.0,
      createdById: profId,
    },
  });

  await prisma.courseInstructor.upsert({
    where: { courseId_instructorId: { courseId: course6.id, instructorId: profId } },
    update: {},
    create: { courseId: course6.id, instructorId: profId },
  });

  // 5. Create Enrollments
  await prisma.courseEnrollment.upsert({
    where: { courseId_studentId: { courseId: course1.id, studentId: student1Id } },
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
    where: { courseId_studentId: { courseId: course2.id, studentId: student2Id } },
    update: { status: EnrollmentStatus.PENDING },
    create: {
      courseId: course2.id,
      studentId: student2Id,
      status: EnrollmentStatus.PENDING,
    },
  });

  // 6. Seed Class Attendance Records
  const dates = ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-08', '2026-09-10'];
  for (const date of dates) {
    await prisma.attendance.upsert({
      where: { courseId_studentId_date: { courseId: course1.id, studentId: student1Id, date } },
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

  // 7. Seed Learning Materials for all 6 courses
  // ── ลบ materials เดิมและสร้างใหม่ทั้งหมดเพื่อให้ข้อมูลสอดคล้อง ──
  console.log('🗑️  Clearing old materials...');
  await prisma.learningMaterial.deleteMany({
    where: {
      courseId: {
        in: [course1.id, course2.id, course3.id, course4.id, course5.id, course6.id],
      },
    },
  });

  console.log('📚 Seeding materials for all courses...');

  // ─── CS101: วิดีโอ 3 ตอน + เอกสาร 2 รายการ (มีแบบทดสอบ) ────────────────────
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course1.id,
        title: 'บทที่ 1: พื้นฐานการเขียนโปรแกรมและโครงสร้างข้อมูล (Introduction to Programming)',
        description: 'แนะนำภาษาโปรแกรมมิ่ง วิธีการติดตั้งเครื่องมือ และโครงสร้างโปรแกรมพื้นฐาน',
        type: MaterialType.VIDEO,
        filePath: 'materials/cs101_lecture01.mp4',
        fileSize: BigInt(480000000),
        mimeType: 'video/mp4',
        duration: 3600,
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course1.id,
        title: 'บทที่ 2: ตัวแปร เงื่อนไข และลูป (Variables, Conditions & Loops)',
        description: 'การประกาศตัวแปร การเขียน if-else และการวนซ้ำด้วย for/while loop',
        type: MaterialType.VIDEO,
        filePath: 'materials/cs101_lecture02.mp4',
        fileSize: BigInt(520000000),
        mimeType: 'video/mp4',
        duration: 4200,
        order: 2,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course1.id,
        title: 'บทที่ 3: ฟังก์ชัน Pointer และ Array ขั้นสูง (Functions, Pointers & Arrays)',
        description: 'การสร้างฟังก์ชัน การใช้งาน Pointer จัดการหน่วยความจำ และการจัดการ Array หลายมิติ',
        type: MaterialType.VIDEO,
        filePath: 'materials/cs101_lecture03.mp4',
        fileSize: BigInt(610000000),
        mimeType: 'video/mp4',
        duration: 5100,
        order: 3,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course1.id,
        title: 'เอกสารประกอบการสอน CS101: ทฤษฎีโครงสร้างข้อมูลและอัลกอริทึม',
        description: 'ตำราเรียนหลักประจำวิชา CS101 ครอบคลุมทฤษฎีและแบบฝึกหัดตลอดภาคการศึกษา',
        type: MaterialType.PDF,
        filePath: 'materials/cs101_textbook.pdf',
        fileSize: BigInt(18500000),
        mimeType: 'application/pdf',
        order: 4,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course1.id,
        title: 'สไลด์บรรยาย CS101: สรุปเนื้อหาและแบบฝึกหัดท้ายบท',
        description: 'สไลด์ประกอบการบรรยายทั้ง 3 บท พร้อมแบบฝึกหัดและเฉลย',
        type: MaterialType.PDF,
        filePath: 'materials/cs101_slides_all.pdf',
        fileSize: BigInt(8200000),
        mimeType: 'application/pdf',
        order: 5,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
    ],
  });

  // ─── ME201: เอกสาร 3 รายการ ไม่มีวิดีโอ ไม่มีแบบทดสอบ ─────────────────────
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course2.id,
        title: 'คู่มือความปลอดภัยและการบำรุงรักษาเครื่องจักร Xการช่าง (Safety Manual)',
        description: 'คู่มือมาตรฐานความปลอดภัยประจำห้องปฏิบัติการ มหาวิทยาลัย Xการช่าง ฉบับสมบูรณ์',
        type: MaterialType.PDF,
        filePath: 'materials/me201_safety_manual.pdf',
        fileSize: BigInt(22000000),
        mimeType: 'application/pdf',
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course2.id,
        title: 'พิมพ์เขียวชิ้นส่วนเครื่องกลและระบบไฮดรอลิก (Mechanical Engineering Blueprints)',
        description: 'แบบพิมพ์เขียวมาตรฐาน ISO ของชิ้นส่วนเครื่องจักรกล ระบบไฮดรอลิก และนิวเมติก',
        type: MaterialType.PDF,
        filePath: 'materials/me201_blueprints.pdf',
        fileSize: BigInt(35000000),
        mimeType: 'application/pdf',
        order: 2,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course2.id,
        title: 'ตำราเรียนกลศาสตร์เครื่องกล: หลักการและการออกแบบระบบอัตโนมัติ',
        description: 'เนื้อหาทฤษฎีกลศาสตร์ขั้นพื้นฐานถึงขั้นสูง พร้อมตัวอย่างการคำนวณในงานช่างจริง',
        type: MaterialType.PDF,
        filePath: 'materials/me201_textbook.pdf',
        fileSize: BigInt(28000000),
        mimeType: 'application/pdf',
        order: 3,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
    ],
  });

  // ─── EE305: วิดีโอ 3 ตอน + เอกสาร 2 รายการ (มีแบบทดสอบ) ─────────────────────
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course3.id,
        title: 'บทที่ 1: วงจรควบคุมมอเตอร์ไฟฟ้าและ Magnetic Contactor (Motor Control Circuits)',
        description: 'การต่อวงจรควบคุมมอเตอร์ 3 เฟส ด้วย Magnetic Contactor, Overload Relay และ Push Button',
        type: MaterialType.VIDEO,
        filePath: 'materials/ee305_lecture01.mp4',
        fileSize: BigInt(550000000),
        mimeType: 'video/mp4',
        duration: 4500,
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course3.id,
        title: 'บทที่ 2: การเขียนโปรแกรม PLC ด้วย Ladder Diagram (PLC Programming)',
        description: 'หลักการทำงานของ PLC, การเขียน Ladder Diagram ควบคุม I/O และ Timer/Counter',
        type: MaterialType.VIDEO,
        filePath: 'materials/ee305_lecture02.mp4',
        fileSize: BigInt(620000000),
        mimeType: 'video/mp4',
        duration: 5400,
        order: 2,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course3.id,
        title: 'บทที่ 3: ระบบ IoT อุตสาหกรรม และการสื่อสาร MQTT (Industrial IoT & MQTT)',
        description: 'การเชื่อมต่ออุปกรณ์ IoT ผ่าน MQTT Protocol, การอ่านค่าเซนเซอร์ และส่งข้อมูลสู่ Cloud',
        type: MaterialType.VIDEO,
        filePath: 'materials/ee305_lecture03.mp4',
        fileSize: BigInt(580000000),
        mimeType: 'video/mp4',
        duration: 4800,
        order: 3,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course3.id,
        title: 'คู่มือปฏิบัติการ EE305: การต่อวงจรและการทดสอบระบบไฟฟ้าอุตสาหกรรม',
        description: 'ขั้นตอนการทดลองปฏิบัติการวงจรควบคุม PLC และ IoT พร้อมใบงานบันทึกผล',
        type: MaterialType.PDF,
        filePath: 'materials/ee305_lab_manual.pdf',
        fileSize: BigInt(15000000),
        mimeType: 'application/pdf',
        order: 4,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course3.id,
        title: 'มาตรฐาน IEC 61131-3 และข้อกำหนดระบบไฟฟ้าอุตสาหกรรม (IEC Standards)',
        description: 'สรุปมาตรฐาน IEC ที่เกี่ยวข้องกับการเขียนโปรแกรม PLC และระบบควบคุมอัตโนมัติ',
        type: MaterialType.PDF,
        filePath: 'materials/ee305_iec_standards.pdf',
        fileSize: BigInt(9800000),
        mimeType: 'application/pdf',
        order: 5,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
    ],
  });

  // ─── SE302: วิดีโอ 3 ตอน ไม่มีเอกสาร (มีแบบทดสอบ) ──────────────────────────
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course4.id,
        title: 'บทที่ 1: Clean Architecture และ SOLID Principles (Clean Code Design)',
        description: 'หลักการ Clean Architecture, SOLID, DRY และการแยก Layer ของระบบซอฟต์แวร์อย่างถูกต้อง',
        type: MaterialType.VIDEO,
        filePath: 'materials/se302_lecture01.mp4',
        fileSize: BigInt(490000000),
        mimeType: 'video/mp4',
        duration: 4200,
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course4.id,
        title: 'บทที่ 2: Microservices Architecture และ Design Patterns (Distributed Systems)',
        description: 'การออกแบบ Microservices, Event-Driven Architecture, Saga Pattern และ API Gateway',
        type: MaterialType.VIDEO,
        filePath: 'materials/se302_lecture02.mp4',
        fileSize: BigInt(560000000),
        mimeType: 'video/mp4',
        duration: 5000,
        order: 2,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course4.id,
        title: 'บทที่ 3: Database Design และ Scalability (High-Performance Systems)',
        description: 'Database Sharding, Caching Strategy, Load Balancing และการออกแบบระบบรองรับ Scale',
        type: MaterialType.VIDEO,
        filePath: 'materials/se302_lecture03.mp4',
        fileSize: BigInt(530000000),
        mimeType: 'video/mp4',
        duration: 4600,
        order: 3,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
    ],
  });

  // ─── AI401: วิดีโอ 3 ตอน + เอกสาร 2 รายการ (มีแบบทดสอบ) ─────────────────────
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course5.id,
        title: 'บทที่ 1: พื้นฐาน Machine Learning และ Statistical Learning Theory',
        description: 'หลักการ Supervised/Unsupervised Learning, Linear Regression, Logistic Regression และ Evaluation Metrics',
        type: MaterialType.VIDEO,
        filePath: 'materials/ai401_lecture01.mp4',
        fileSize: BigInt(510000000),
        mimeType: 'video/mp4',
        duration: 4400,
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course5.id,
        title: 'บทที่ 2: Deep Learning และ Neural Network Architecture (CNN, RNN, Transformer)',
        description: 'โครงสร้าง Neural Network, Backpropagation, Dropout, CNN สำหรับ Computer Vision',
        type: MaterialType.VIDEO,
        filePath: 'materials/ai401_lecture02.mp4',
        fileSize: BigInt(680000000),
        mimeType: 'video/mp4',
        duration: 5800,
        order: 2,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course5.id,
        title: 'บทที่ 3: การประยุกต์ใช้ AI ในงานอุตสาหกรรมและ Generative AI',
        description: 'Computer Vision ในสายการผลิต, NLP, การใช้ LLM, Fine-tuning และ Prompt Engineering',
        type: MaterialType.VIDEO,
        filePath: 'materials/ai401_lecture03.mp4',
        fileSize: BigInt(590000000),
        mimeType: 'video/mp4',
        duration: 5200,
        order: 3,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course5.id,
        title: 'ตำราเรียน AI401: หลักการ Machine Learning และ Deep Learning ฉบับสมบูรณ์',
        description: 'เนื้อหาครอบคลุมทฤษฎีทางคณิตศาสตร์ สถิติ และอัลกอริทึม ML/DL พร้อม Python Code ตัวอย่าง',
        type: MaterialType.PDF,
        filePath: 'materials/ai401_textbook.pdf',
        fileSize: BigInt(32000000),
        mimeType: 'application/pdf',
        order: 4,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course5.id,
        title: 'แบบฝึกหัด Python: Machine Learning Workshop และ Jupyter Notebooks',
        description: 'ชุดแบบฝึกหัดโค้ด Python พร้อม Dataset สำหรับฝึกสร้างโมเดล ML/DL ด้วยตนเอง',
        type: MaterialType.PDF,
        filePath: 'materials/ai401_python_exercises.pdf',
        fileSize: BigInt(12500000),
        mimeType: 'application/pdf',
        order: 5,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
    ],
  });

  // ─── AUTO101: วิดีโอ 3 ตอน + เอกสาร 2 รายการ ไม่มีแบบทดสอบ ──────────────────
  await prisma.learningMaterial.createMany({
    data: [
      {
        courseId: course6.id,
        title: 'บทที่ 1: เครื่องยนต์สันดาปภายในและระบบจุดระเบิด (Internal Combustion Engine)',
        description: 'หลักการทำงานของเครื่องยนต์ 4 จังหวะ ระบบเชื้อเพลิง หัวฉีด และระบบจุดระเบิด EFI',
        type: MaterialType.VIDEO,
        filePath: 'materials/auto101_lecture01.mp4',
        fileSize: BigInt(470000000),
        mimeType: 'video/mp4',
        duration: 4000,
        order: 1,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course6.id,
        title: 'บทที่ 2: ระบบส่งกำลังและเกียร์อัตโนมัติ (Transmission & Drivetrain Systems)',
        description: 'เกียร์ธรรมดา เกียร์อัตโนมัติ CVT ระบบขับเคลื่อน 4 ล้อ และ Differential',
        type: MaterialType.VIDEO,
        filePath: 'materials/auto101_lecture02.mp4',
        fileSize: BigInt(505000000),
        mimeType: 'video/mp4',
        duration: 4300,
        order: 2,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course6.id,
        title: 'บทที่ 3: ยานยนต์ไฟฟ้า (Electric Vehicles - EV) และระบบแบตเตอรี่',
        description: 'มอเตอร์ไฟฟ้า แบตเตอรี่ Li-ion, BMS, ระบบชาร์จ และเปรียบเทียบ EV กับยานยนต์สันดาป',
        type: MaterialType.VIDEO,
        filePath: 'materials/auto101_lecture03.mp4',
        fileSize: BigInt(545000000),
        mimeType: 'video/mp4',
        duration: 4700,
        order: 3,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course6.id,
        title: 'คู่มือปฏิบัติการช่างยนต์: การตรวจสอบและซ่อมบำรุงรถยนต์ขั้นพื้นฐาน',
        description: 'ขั้นตอนการวินิจฉัยปัญหา การใช้เครื่องมือวัด OBD-II และการซ่อมบำรุงตามวาระ',
        type: MaterialType.PDF,
        filePath: 'materials/auto101_workshop_manual.pdf',
        fileSize: BigInt(19500000),
        mimeType: 'application/pdf',
        order: 4,
        status: MaterialStatus.APPROVED,
        uploadedById: profId,
      },
      {
        courseId: course6.id,
        title: 'ตารางข้อมูลทางเทคนิคและมาตรฐาน EV / ICE สำหรับช่างยนต์',
        description: 'ตารางสเปค ค่าทนทาน และมาตรฐาน ISO ของชิ้นส่วนยานยนต์ทั้ง ICE และ EV',
        type: MaterialType.PDF,
        filePath: 'materials/auto101_technical_specs.pdf',
        fileSize: BigInt(11000000),
        mimeType: 'application/pdf',
        order: 5,
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
      metadata: JSON.stringify({ message: 'มหาวิทยาลัย Xการช่าง LMS Dataset Seeded Successfully with all 6 courses' }),
    },
  });

  console.log('✅ Seed Completed! Summary:');
  console.log('   📚 6 Courses: CS101 (video+doc+quiz), ME201 (doc only), EE305 (video+doc+quiz),');
  console.log('                SE302 (video+quiz, no doc), AI401 (video+doc+quiz), AUTO101 (video+doc, no quiz)');
  console.log('   🎬 Video Materials: CS101×3, EE305×3, SE302×3, AI401×3, AUTO101×3 = 15 videos');
  console.log('   📄 Document Materials: CS101×2, ME201×3, EE305×2, AI401×2, AUTO101×2 = 11 docs');
  console.log('   📝 Quiz: CS101, EE305, SE302, AI401 (4 courses)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
