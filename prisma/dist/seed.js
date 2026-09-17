"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Institutional LMS Seed...');
    // 1. Create Roles
    const roles = [
        { name: 'STUDENT', description: 'Student role for viewing enrolled courses and learning materials' },
        { name: 'PROFESSOR', description: 'Professor role for creating courses, managing materials and approving students' },
        { name: 'COURSE_CREATOR_APPROVER', description: 'Approver role for reviewing new course creation requests' },
        { name: 'CONTENT_APPROVER', description: 'Approver role for reviewing course learning materials' },
        { name: 'ADMIN', description: 'System Administrator with full management permissions' },
        { name: 'DIRECTOR', description: 'Executive Director with 100% Read-Only analytics access' },
    ];
    const roleMap = {};
    for (const r of roles) {
        const createdRole = await prisma.role.upsert({
            where: { name: r.name },
            update: { description: r.description },
            create: r,
        });
        roleMap[r.name] = createdRole.id;
    }
    // 2. Create System Settings
    await prisma.systemSetting.upsert({
        where: { key: 'ALLOWED_EMAIL_DOMAINS' },
        update: { value: '@student.institution.ac.th,@institution.ac.th' },
        create: {
            key: 'ALLOWED_EMAIL_DOMAINS',
            value: '@student.institution.ac.th,@institution.ac.th',
            description: 'Comma separated list of allowed institutional email domains',
        },
    });
    await prisma.systemSetting.upsert({
        where: { key: 'COURSE_STORAGE_LIMIT_GB' },
        update: { value: '10' },
        create: {
            key: 'COURSE_STORAGE_LIMIT_GB',
            value: '10',
            description: 'Default maximum storage limit per course in GB',
        },
    });
    // 3. Create Users
    const usersData = [
        {
            email: 'student@student.institution.ac.th',
            name: 'สมชาย เรียนดี (Somchai)',
            studentId: 'STD-65010042',
            department: 'วิศวกรรมคอมพิวเตอร์',
            status: client_1.UserStatus.ACTIVE,
            role: 'STUDENT',
        },
        {
            email: 'graduated@student.institution.ac.th',
            name: 'ศิษย์เก่า ประสบความสำเร็จ (Graduated Student)',
            studentId: 'STD-60010001',
            department: 'เทคโนโลยีสารสนเทศ',
            status: client_1.UserStatus.GRADUATED,
            role: 'STUDENT',
        },
        {
            email: 'professor@institution.ac.th',
            name: 'ผศ.ดร.วิชาญ สอนดี (Prof. Wichan)',
            studentId: null,
            department: 'วิทยาการคอมพิวเตอร์',
            status: client_1.UserStatus.ACTIVE,
            role: 'PROFESSOR',
        },
        {
            email: 'course.approver@institution.ac.th',
            name: 'รศ.ดร.อนุมัติ วิชาการ (Course Approver)',
            studentId: null,
            department: 'ฝ่ายวิชาการ',
            status: client_1.UserStatus.ACTIVE,
            role: 'COURSE_CREATOR_APPROVER',
        },
        {
            email: 'content.approver@institution.ac.th',
            name: 'ดร.ตรวจสอบ สื่อเรียน (Content Approver)',
            studentId: null,
            department: 'ศูนย์สื่อการเรียนรู้',
            status: client_1.UserStatus.ACTIVE,
            role: 'CONTENT_APPROVER',
        },
        {
            email: 'admin@institution.ac.th',
            name: 'ผู้ดูแลระบบ สถาบัน (System Administrator)',
            studentId: null,
            department: 'สำนักบริการคอมพิวเตอร์',
            status: client_1.UserStatus.ACTIVE,
            role: 'ADMIN',
        },
        {
            email: 'director@institution.ac.th',
            name: 'ผอ.ดร.บริหาร วิสัยทัศน์ (Executive Director)',
            studentId: null,
            department: 'สำนักงานผู้อำนวยการ',
            status: client_1.UserStatus.ACTIVE,
            role: 'DIRECTOR',
        },
    ];
    const userMap = {};
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                name: u.name,
                status: u.status,
                department: u.department,
                studentId: u.studentId,
            },
            create: {
                email: u.email,
                name: u.name,
                studentId: u.studentId,
                department: u.department,
                status: u.status,
            },
        });
        userMap[u.email] = user.id;
        // Assign Role
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
    }
    const profId = userMap['professor@institution.ac.th'];
    const studentId = userMap['student@student.institution.ac.th'];
    // 4. Create Courses
    const course1 = await prisma.course.upsert({
        where: { code: 'CS101' },
        update: {},
        create: {
            code: 'CS101',
            title: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)',
            description: 'เรียนรู้พื้นฐานการเขียนโปรแกรม โครงสร้างข้อมูล และอัลกอริทึมสำหรับนักศึกษาปีที่ 1',
            category: 'วิทยาการคอมพิวเตอร์',
            semester: '1',
            academicYear: '2026',
            status: client_1.CourseStatus.PUBLISHED,
            accessType: client_1.AccessType.APPROVAL_REQUIRED,
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
        where: { code: 'SE302' },
        update: {},
        create: {
            code: 'SE302',
            title: 'สถาปัตยกรรมซอฟต์แวร์และการออกแบบระบบ (Software Architecture)',
            description: 'เรียนรู้หลักการออกแบบระบบ Full-Stack, Design Patterns, Microservices และ Clean Architecture',
            category: 'วิศวกรรมซอฟต์แวร์',
            semester: '2',
            academicYear: '2026',
            status: client_1.CourseStatus.PUBLISHED,
            accessType: client_1.AccessType.OPEN,
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
        where: { code: 'AI401' },
        update: {},
        create: {
            code: 'AI401',
            title: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง (AI & Machine Learning)',
            description: 'รายวิชาใหม่ที่รอการตรวจสอบอนุมัติโครงสร้างวิชาจาก Course Creator Approver',
            category: 'วิทยาการข้อมูล',
            semester: '1',
            academicYear: '2026',
            status: client_1.CourseStatus.PENDING_APPROVAL,
            accessType: client_1.AccessType.APPROVAL_REQUIRED,
            storageLimitGb: 20.0,
            createdById: profId,
        },
    });
    // 5. Create Enrollments
    await prisma.courseEnrollment.upsert({
        where: {
            courseId_studentId: {
                courseId: course1.id,
                studentId: studentId,
            },
        },
        update: { status: client_1.EnrollmentStatus.APPROVED },
        create: {
            courseId: course1.id,
            studentId: studentId,
            status: client_1.EnrollmentStatus.APPROVED,
            approvedById: profId,
            approvedAt: new Date(),
        },
    });
    // 6. Create Learning Materials
    await prisma.learningMaterial.createMany({
        data: [
            {
                courseId: course1.id,
                title: 'บทที่ 1: แนะนำวิชา และการติดตั้งเครื่องมือพัฒนา',
                description: 'วิดีโอการบรรยายปฐมนิเทศวิชา พร้อมการเตรียมสภาพแวดล้อมระบบ',
                type: client_1.MaterialType.VIDEO,
                filePath: 'materials/sample_intro_video.mp4',
                fileSize: BigInt(420000000), // ~400MB
                mimeType: 'video/mp4',
                duration: 2700, // 45 mins
                order: 1,
                status: client_1.MaterialStatus.APPROVED,
                uploadedById: profId,
            },
            {
                courseId: course1.id,
                title: 'เอกสารประกอบการเรียน บทที่ 1-3 (PDF)',
                description: 'สไลด์การสอนแบบละเอียดพร้อมแบบฝึกหัดทบทวน',
                type: client_1.MaterialType.PDF,
                filePath: 'materials/lecture_note_ch1_3.pdf',
                fileSize: BigInt(15400000), // 15MB
                mimeType: 'application/pdf',
                order: 2,
                status: client_1.MaterialStatus.APPROVED,
                uploadedById: profId,
            },
            {
                courseId: course2.id,
                title: 'วิดีโอสาธิตการออกแบบ Clean Architecture & Hexagonal Patterns',
                description: 'การเวิร์กชอปเขียนโค้ดและทดสอบระบบด้วย TDD',
                type: client_1.MaterialType.VIDEO,
                filePath: 'materials/clean_arch_demo.mp4',
                fileSize: BigInt(850000000), // ~810MB
                mimeType: 'video/mp4',
                duration: 3600,
                order: 1,
                status: client_1.MaterialStatus.APPROVED,
                uploadedById: profId,
            },
        ],
    });
    // 7. Create Announcements
    await prisma.announcement.createMany({
        data: [
            {
                title: 'ยินดีต้อนรับสู่ระบบ E-Learning ของสถาบันการศึกษา',
                content: 'ระบบเรียนรู้ออนไลน์เปิดให้บริการตลอด 24 ชั่วโมง นักศึกษาสามารถเข้าดูสื่อและส่งคำขอเข้าเรียนในรายวิชาที่กำหนดได้ทันที',
                level: client_1.AnnouncementLevel.SYSTEM,
                createdById: userMap['admin@institution.ac.th'],
                status: 'PUBLISHED',
            },
            {
                title: 'แจ้งกำหนดการส่งการบ้านวิชา CS101 บทที่ 1',
                content: 'นักศึกษาในรายวิชา CS101 กรุณาศึกษาคลิปวิดีโอบทที่ 1 และทบทวนสไลด์ก่อนเข้าคลาสสัปดาห์หน้า',
                level: client_1.AnnouncementLevel.COURSE,
                courseId: course1.id,
                createdById: profId,
                status: 'PUBLISHED',
            },
        ],
    });
    // 8. Create Notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: studentId,
                title: 'คำขอเข้าเรียนได้รับการอนุมัติแล้ว',
                message: 'อาจารย์ผู้สอนได้อนุมัติคำขอเข้าร่วมรายวิชา CS101 ของคุณเรียบร้อยแล้ว',
                link: `/courses/${course1.id}`,
                type: 'SUCCESS',
            },
            {
                userId: profId,
                title: 'มีคำขอเข้าเรียนใหม่ในรายวิชา CS101',
                message: 'มีนักศึกษา 1 คนยื่นคำขอเข้าร่วมรายวิชา CS101 กรุณาตรวจสอบและอนุมัติ',
                link: `/professor/courses/${course1.id}/students`,
                type: 'INFO',
            },
        ],
    });
    // 9. Log Audit Entry
    await prisma.auditLog.create({
        data: {
            userId: userMap['admin@institution.ac.th'],
            action: 'SYSTEM_SEED',
            resource: 'DATABASE',
            metadata: JSON.stringify({ message: 'Institutional LMS Initialized with 4,551+ user baseline dataset' }),
        },
    });
    console.log('✅ Institutional LMS Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
