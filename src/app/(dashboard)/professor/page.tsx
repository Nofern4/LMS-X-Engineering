'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  HardDrive,
  Clock,
  Eye,
  UserCheck,
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  Award,
  AlertCircle,
  FileText,
  Lock,
  Globe,
  Video,
  Upload,
  Link2,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

const DEFAULT_BRANCH_STUDENTS: Record<string, any[]> = {
  CS101: [
    { id: 'cs-1', studentId: 'XK-65010042', name: 'สมชาย ช่างกล (Somchai)', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-2', studentId: 'XK-65010101', name: 'ปิยะพงษ์ วิศวการ', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-3', studentId: 'XK-65010102', name: 'กานดา โค้ดดิ้ง', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-4', studentId: 'XK-65010103', name: 'ธีรภัทร ชิปเซ็ต', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-5', studentId: 'XK-65010104', name: 'ชยพล เน็ตเวิร์ก', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-6', studentId: 'XK-65010105', name: 'พัชราภรณ์ ดาต้าเบส', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-7', studentId: 'XK-65010106', name: 'กฤษฎา ระบบฝังตัว', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-8', studentId: 'XK-65010107', name: 'นภัสสร อัลกอริทึม', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-9', studentId: 'XK-65010108', name: 'ธนวัฒน์ ปัญญาประดิษฐ์', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-10', studentId: 'XK-65010109', name: 'รัชชานนท์ คลาวด์คอมพิวติ้ง', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-11', studentId: 'XK-65010110', name: 'ศุภกานต์ ไซเบอร์ซีเคียวริตี้', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-12', studentId: 'XK-65010111', name: 'มนัสวิน สถาปัตยกรรมคอมพ์', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-13', studentId: 'XK-65010112', name: 'ฐิติพร วงจรดิจิทัล', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-14', studentId: 'XK-65010113', name: 'พงศธร คอมไพเลอร์', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
    { id: 'cs-15', studentId: 'XK-65010114', name: 'ปวริศร์ โอเปอเรติงซิสเต็ม', courseCode: 'CS101', category: 'วิศวกรรมคอมพิวเตอร์', status: 'APPROVED' },
  ],
  ME201: [
    { id: 'me-1', studentId: 'XK-65020042', name: 'สมศักดิ์ กลึงเหล็ก', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-2', studentId: 'XK-65020101', name: 'สุรชัย ช่างกลึง', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-3', studentId: 'XK-65020102', name: 'ธนพล ไฮดรอลิก', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-4', studentId: 'XK-65020103', name: 'วรวิทย์ นิวแมติกส์', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-5', studentId: 'XK-65020104', name: 'กิตติพงษ์ เขียนแบบช่าง', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-6', studentId: 'XK-65020105', name: 'ประสิทธิ์ งานเชื่อมโลหะ', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-7', studentId: 'XK-65020106', name: 'เจษฎา วัสดุวิศวกรรม', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-8', studentId: 'XK-65020107', name: 'ชานนท์ กลศาสตร์ของแข็ง', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-9', studentId: 'XK-65020108', name: 'เอกลักษณ์ เครื่องมือวัดละเอียด', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-10', studentId: 'XK-65020109', name: 'วุฒิภัทร โลหะวิทยา', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-11', studentId: 'XK-65020110', name: 'ธนาคาร ควบคุมซีเอ็นซี (CNC)', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-12', studentId: 'XK-65020111', name: 'อนุสรณ์ กรรมวิธีการผลิต', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-13', studentId: 'XK-65020112', name: 'ศรายุทธ ออกแบบชิ้นส่วนเครื่องกล', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
    { id: 'me-14', studentId: 'XK-65020113', name: 'ชาญณรงค์ ถ่ายโอนความร้อน', courseCode: 'ME201', category: 'ช่างกลโรงงาน', status: 'APPROVED' },
  ],
  EE305: [
    { id: 'ee-1', studentId: 'XK-65010088', name: 'สมศักดิ์ ไฟฟ้า (Somsak)', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-2', studentId: 'XK-65030101', name: 'อนุสรณ์ หม้อแปลงไฟฟ้า', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-3', studentId: 'XK-65030102', name: 'ศุภชัย พาวเวอร์ซิสเต็ม', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-4', studentId: 'XK-65030103', name: 'เกียรติศักดิ์ วงจรไฟฟ้าแรงสูง', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-5', studentId: 'XK-65030104', name: 'ปรเมษฐ์ ควบคุมมอเตอร์', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-6', studentId: 'XK-65030105', name: 'วีรยุทธ รีเลย์ป้องกัน', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-7', studentId: 'XK-65030106', name: 'สันติภาพ พลังงานหมุนเวียน', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-8', studentId: 'XK-65030107', name: 'นพรัตน์ ติดตั้งไฟฟ้าอาคาร', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-9', studentId: 'XK-65030108', name: 'ชวิน โปรแกรมเมเบิลลอจิก (PLC)', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-10', studentId: 'XK-65030109', name: 'ก้องภพ ระบบส่งจ่ายกำลังไฟฟ้า', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-11', studentId: 'XK-65030110', name: 'อัครเดช ตู้สวิตช์บอร์ด', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-12', studentId: 'XK-65030111', name: 'สหรัฐ เครื่องกำเนิดไฟฟ้า', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
    { id: 'ee-13', studentId: 'XK-65030112', name: 'ธนากร อิเล็กทรอนิกส์กำลัง', courseCode: 'EE305', category: 'ช่างไฟฟ้ากำลัง', status: 'APPROVED' },
  ],
  SE302: [
    { id: 'se-1', studentId: 'XK-65050101', name: 'วรัญญา สถาปัตยกรรมซอฟต์แวร์', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-2', studentId: 'XK-65050102', name: 'ธนภัทร ไมโครเซอร์วิส', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-3', studentId: 'XK-65050103', name: 'ศรุต คลีนโค้ด', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-4', studentId: 'XK-65050104', name: 'อภิวัฒน์ เดฟออปส์ (DevOps)', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-5', studentId: 'XK-65050105', name: 'ชญาดา ควบคุมคุณภาพซอฟต์แวร์', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-6', studentId: 'XK-65050106', name: 'ภานุมาศ ฟูลสแต็ก', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-7', studentId: 'XK-65050107', name: 'ภูวดล สแครมมาสเตอร์', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-8', studentId: 'XK-65050108', name: 'ศิรชัช ระบบกระจายงาน', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-9', studentId: 'XK-65050109', name: 'กมลชนก คลาวด์เนทีฟ', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-10', studentId: 'XK-65050110', name: 'อัศวิน ทดสอบระบบอัตโนมัติ', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-11', studentId: 'XK-65050111', name: 'พิชญ์พงศ์ ซอฟต์แวร์ซิเคียวริตี้', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-12', studentId: 'XK-65050112', name: 'ชาคริต วิศวกรรมข้อมูลขนาดใหญ่', courseCode: 'SE302', category: 'วิศวกรรมซอฟต์แวร์', status: 'APPROVED' },
  ],
};

const BRANCH_STATS: Record<string, { enrolled: number; completed: number; rate: string }> = {
  ALL: { enrolled: 716, completed: 626, rate: '87.4%' },
  CS101: { enrolled: 245, completed: 218, rate: '89.0%' },
  ME201: { enrolled: 182, completed: 156, rate: '85.7%' },
  EE305: { enrolled: 164, completed: 142, rate: '86.6%' },
  SE302: { enrolled: 125, completed: 110, rate: '88.0%' },
};

interface ProfessorVideoClip {
  id: string;
  courseCode: string;
  courseTitle: string;
  category: string;
  title: string;
  description: string;
  durationText: string;
  fileSizeText: string;
  uploadDate: string;
  videoUrl?: string;
  viewsCount: number;
}

const PROFESSOR_VIDEO_CLIPS: ProfessorVideoClip[] = [
  {
    id: 'vid-cs-1',
    courseCode: 'CS101',
    courseTitle: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)',
    category: 'วิศวกรรมคอมพิวเตอร์',
    title: 'บทที่ 1: พื้นฐานการเขียนโปรแกรมและโครงสร้างข้อมูลเบื้องต้น',
    description: 'แนะนำภาษาโปรแกรมมิ่ง วิธีการติดตั้งเครื่องมือ Compiler, IDE และโครงสร้างโปรแกรมพื้นฐานสำหรับช่างเทคโนโลยี',
    durationText: '60:00 นาที',
    fileSizeText: '480 MB',
    uploadDate: '1 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    viewsCount: 1420,
  },
  {
    id: 'vid-cs-2',
    courseCode: 'CS101',
    courseTitle: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)',
    category: 'วิศวกรรมคอมพิวเตอร์',
    title: 'บทที่ 2: ตัวแปร ชนิดข้อมูล เงื่อนไข และลูปการทำงาน',
    description: 'การประกาศตัวแปร ชนิดข้อมูลต่างๆ การใช้คำสั่ง if-else ตรวจสอบเงื่อนไข และการวนซ้ำด้วย for/while loop',
    durationText: '70:00 นาที',
    fileSizeText: '520 MB',
    uploadDate: '3 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    viewsCount: 1280,
  },
  {
    id: 'vid-cs-3',
    courseCode: 'CS101',
    courseTitle: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (Computer Programming I)',
    category: 'วิศวกรรมคอมพิวเตอร์',
    title: 'บทที่ 3: ฟังก์ชัน พอยน์เตอร์ และอาร์เรย์ขั้นสูง',
    description: 'การสร้าง Modular Functions, การจัดการหน่วยความจำผ่าน Pointer และการประมวลผล Array หลายมิติ',
    durationText: '85:00 นาที',
    fileSizeText: '610 MB',
    uploadDate: '7 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    viewsCount: 1150,
  },
  {
    id: 'vid-ee-1',
    courseCode: 'EE305',
    courseTitle: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT (Industrial Electrical Control & IoT)',
    category: 'ช่างไฟฟ้ากำลัง',
    title: 'บทที่ 1: วงจรควบคุมมอเตอร์ไฟฟ้าและ Magnetic Contactor',
    description: 'การต่อวงจรควบคุมมอเตอร์ 3 เฟส ด้วย Magnetic Contactor, Overload Relay และระบบ Safety Interlock ในโรงงาน',
    durationText: '75:00 นาที',
    fileSizeText: '550 MB',
    uploadDate: '4 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    viewsCount: 940,
  },
  {
    id: 'vid-ee-2',
    courseCode: 'EE305',
    courseTitle: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT (Industrial Electrical Control & IoT)',
    category: 'ช่างไฟฟ้ากำลัง',
    title: 'บทที่ 2: การเขียนโปรแกรม PLC ด้วย Ladder Diagram และการเชื่อมต่อ IoT',
    description: 'หลักการทำงานของ PLC อุตสาหกรรม, การออกแบบ Ladder Diagram ควบคุม I/O, Timer/Counter และเชื่อมต่อ IoT Broker',
    durationText: '90:00 นาที',
    fileSizeText: '620 MB',
    uploadDate: '9 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    viewsCount: 880,
  },
  {
    id: 'vid-se-1',
    courseCode: 'SE302',
    courseTitle: 'วิศวกรรมซอฟต์แวร์ขั้นสูงและสถาปัตยกรรมระบบ (Advanced Software Engineering)',
    category: 'วิศวกรรมซอฟต์แวร์',
    title: 'บทที่ 1: สถาปัตยกรรม Clean Architecture และ Microservices',
    description: 'การแบ่ง Layer ระบบแบบ Clean Architecture, Domain-Driven Design และการสื่อสารระหว่าง Microservices',
    durationText: '75:00 นาที',
    fileSizeText: '580 MB',
    uploadDate: '5 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    viewsCount: 820,
  },
  {
    id: 'vid-se-2',
    courseCode: 'SE302',
    courseTitle: 'วิศวกรรมซอฟต์แวร์ขั้นสูงและสถาปัตยกรรมระบบ (Advanced Software Engineering)',
    category: 'วิศวกรรมซอฟต์แวร์',
    title: 'บทที่ 2: Design Patterns สำหรับระบบขนาดใหญ่และการทำ Automated Testing',
    description: 'Factory, Repository, Unit of Work, Observer และการเซ็ตอัป Unit/Integration Tests ร่วมกับ CI/CD Pipeline',
    durationText: '60:00 นาที',
    fileSizeText: '490 MB',
    uploadDate: '10 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    viewsCount: 760,
  },
  {
    id: 'vid-me-1',
    courseCode: 'ME201',
    courseTitle: 'วิศวกรรมเครื่องกลและกรรมวิธีการผลิตชิ้นส่วน (Mechanical Engineering)',
    category: 'ช่างกลโรงงาน',
    title: 'บทที่ 1: พื้นฐานงานกลึง งานกัดโลหะ และความปลอดภัยในโรงงานช่างกล',
    description: 'หลักการทำงานของเครื่องกลึง เครื่องกัด และการเลือกใช้เครื่องมือตัดสำหรับโลหะแต่ละชนิดตามมาตรฐานสากล',
    durationText: '55:00 นาที',
    fileSizeText: '470 MB',
    uploadDate: '2 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    viewsCount: 780,
  },
  {
    id: 'vid-me-2',
    courseCode: 'ME201',
    courseTitle: 'วิศวกรรมเครื่องกลและกรรมวิธีการผลิตชิ้นส่วน (Mechanical Engineering)',
    category: 'ช่างกลโรงงาน',
    title: 'บทที่ 2: การเขียนโปรแกรมเครื่องจักร CNC และการวัดละเอียดทางวิศวกรรม',
    description: 'การเขียนโค้ด G-Code / M-Code สำหรับเครื่องกลึง CNC และการใช้อุปกรณ์วัดละเอียดเกจบล็อก เวอร์เนียร์ ไมโครมิเตอร์',
    durationText: '65:00 นาที',
    fileSizeText: '540 MB',
    uploadDate: '6 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    viewsCount: 860,
  },
];

function ProfessorDashboardContent() {
  const router = useRouter();
  const coursesRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseStudents, setCourseStudents] = useState<Record<string, any[]>>(DEFAULT_BRANCH_STUDENTS);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('ALL');
  const [showAllStudents, setShowAllStudents] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyCreatedCode, setNewlyCreatedCode] = useState<string | null>(null);

  const [selectedVideoCourseFilter, setSelectedVideoCourseFilter] = useState<string>('ALL');
  const [activeVideoModal, setActiveVideoModal] = useState<ProfessorVideoClip | null>(null);
  const [extraVideoClips, setExtraVideoClips] = useState<ProfessorVideoClip[]>([]);
  const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState<number>(0);

  // Professor Taught Courses Selector List (4 Core Disciplines)
  const [professorCourses, setProfessorCourses] = useState([
    { code: 'CS101', label: 'CS101 (วิศวกรรมคอมพิวเตอร์)', category: 'วิศวกรรมคอมพิวเตอร์' },
    { code: 'SE302', label: 'SE302 (วิศวกรรมซอฟต์แวร์)', category: 'วิศวกรรมซอฟต์แวร์' },
    { code: 'ME201', label: 'ME201 (ช่างกลโรงงาน)', category: 'ช่างกลโรงงาน' },
    { code: 'EE305', label: 'EE305 (ช่างไฟฟ้ากำลัง)', category: 'ช่างไฟฟ้ากำลัง' },
  ]);

  // Create Course Modal State (2-Step Wizard)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('ทั่วไป (เปิดกว้างทุกสาขาวิชา)');
  const [newDescription, setNewDescription] = useState('');
  const [newAccessType, setNewAccessType] = useState<'APPROVAL_REQUIRED' | 'OPEN'>('APPROVAL_REQUIRED');

  // Step 2 Media & Quiz State
  const [materialType, setMaterialType] = useState<'VIDEO' | 'DOCUMENT'>('VIDEO');
  const [materialTitle, setMaterialTitle] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState('');
  const [hasGoogleFormsQuiz, setHasGoogleFormsQuiz] = useState(false);
  const [googleFormsUrl, setGoogleFormsUrl] = useState('');

  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const handleOpenCreateModal = () => {
    setCreateStep(1);
    setNewCode('');
    setNewTitle('');
    setNewDescription('');
    setMaterialType('VIDEO');
    setMaterialTitle('');
    setUploadedFile(null);
    setUploadedFileName(null);
    setVideoLinkUrl('');
    setHasGoogleFormsQuiz(false);
    setGoogleFormsUrl('');
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    if (searchParams?.get('create') === 'true') {
      handleOpenCreateModal();
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then(async (data) => {
        const cList = data.courses || [];
        setCourses(cList);

        // Fetch real student enrollments for each course in parallel
        const promises = cList.map(async (c: any) => {
          try {
            const r = await fetch(`/api/courses/${c.id}/students`);
            const ed = await r.json();
            return {
              code: c.code,
              enrollments: (ed.enrollments || []).map((en: any) => ({
                id: en.id,
                studentId: en.student?.studentId || 'XK-65010042',
                name: en.student?.name || 'นักศึกษา',
                status: en.status,
              }))
            };
          } catch {
            return { code: c.code, enrollments: [] };
          }
        });

        const results = await Promise.all(promises);
        const mapping: Record<string, any[]> = { ...DEFAULT_BRANCH_STUDENTS };
        results.forEach((item) => {
          if (item.enrollments && item.enrollments.length > 0) {
            const existing = mapping[item.code] || [];
            const dbIds = new Set(item.enrollments.map((e: any) => e.studentId));
            const merged = [
              ...item.enrollments,
              ...existing.filter((s: any) => !dbIds.has(s.studentId)),
            ];
            mapping[item.code] = merged;
          }
        });
        setCourseStudents(mapping);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const fetchPendingEnrollments = () => {
      fetch('/api/courses/enrollments?status=PENDING&t=' + Date.now(), { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          setPendingEnrollmentsCount(data.enrollments?.length || 0);
        })
        .catch(() => {});
    };

    fetchPendingEnrollments();
    const interval = setInterval(fetchPendingEnrollments, 3000);
    window.addEventListener('enrollment_updated', fetchPendingEnrollments);
    window.addEventListener('focus', fetchPendingEnrollments);
    return () => {
      clearInterval(interval);
      window.removeEventListener('enrollment_updated', fetchPendingEnrollments);
      window.removeEventListener('focus', fetchPendingEnrollments);
    };
  }, []);

  const courseInterestData = courses.slice(0, 3).map((c, idx) => ({
    code: c.code,
    title: c.title,
    category: c.category,
    interestScore: 95 - (idx * 5),
    viewsCount: (c._count?.materials ?? 0) * 120 + (c._count?.enrollments ?? 0) * 80,
    enrolledCount: c._count?.enrollments ?? 0,
    topMaterial: `${c.title} (${c._count?.materials ?? 0} บทเรียน)`,
    trend: c._count?.enrollments > 0 ? `+${c._count.enrollments} คนเรียน` : 'เปิดให้ลงทะเบียน',
  }));

  const handleCreateCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createStep === 1) {
      if (!newTitle.trim()) return;
      if (!newCode.trim()) {
        setNewCode(`XK-${Math.floor(100 + Math.random() * 900)}`);
      }
      setCreateStep(2);
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const codeToUse = newCode.trim() || `XK-${Math.floor(100 + Math.random() * 900)}-${Date.now().toString().slice(-4)}`;

      let userPayload: any = { id: 'prof-1', roles: ['PROFESSOR'] };
      try {
        const sess = localStorage.getItem('user_session');
        if (sess) {
          const parsed = JSON.parse(sess);
          userPayload = { id: parsed.id || 'prof-1', email: parsed.email, roles: parsed.roles || ['PROFESSOR'] };
        }
      } catch {}

      // Prepare initial material:
      // If user uploaded a physical file, we do NOT create a dummy initial material here
      // because it will be uploaded directly via /api/courses/${id}/materials right below.
      // If user provided a video link (YouTube, Drive, etc.), create the material with that link.
      const initialMaterialPayload = uploadedFile
        ? null
        : videoLinkUrl.trim()
        ? {
            title: materialTitle.trim() || `บทที่ 1: แนะนำรายวิชา ${newTitle.trim()}`,
            type: materialType,
            filePath: videoLinkUrl.trim(),
            videoUrl: videoLinkUrl.trim(),
            fileSize: 52428800,
            mimeType: materialType === 'VIDEO' ? 'video/mp4' : 'application/pdf',
            description: '',
          }
        : null;

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userPayload,
          code: codeToUse,
          title: newTitle.trim(),
          description: newDescription.trim(), // Leave empty if user didn't provide one
          category: newCategory,
          semester: '1',
          academicYear: '2026',
          accessType: newAccessType,
          storageLimitGb: '10.0',
          hasQuiz: hasGoogleFormsQuiz,
          quizUrl: hasGoogleFormsQuiz ? googleFormsUrl.trim() : null,
          initialMaterial: initialMaterialPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'เกิดข้อผิดพลาดในการสร้างรายวิชา');
        setIsSubmittingCourse(false);
        return;
      }

      const newCourseCode = codeToUse;
      const savedTitle = newTitle.trim();
      const savedCategory = newCategory;
      const savedDescription = newDescription.trim();
      const savedCourseId = data.course?.id || '';

      // If user uploaded a physical file, also upload it to the course's materials API
      if (uploadedFile && savedCourseId) {
        try {
          const fd = new FormData();
          fd.append('title', materialTitle.trim() || `บทที่ 1: แนะนำรายวิชา ${savedTitle}`);
          fd.append('type', materialType);
          fd.append('userId', userPayload.id || 'prof-1');
          fd.append('file', uploadedFile);
          if (videoLinkUrl.trim()) {
            fd.append('link', videoLinkUrl.trim());
          }
          await fetch(`/api/courses/${savedCourseId}/materials`, {
            method: 'POST',
            headers: {
              'x-user': JSON.stringify(userPayload)
            },
            body: fd,
          });
        } catch (uploadErr) {
          console.error('Initial material physical upload error:', uploadErr);
        }
      }

      const newCourseItem = {
        code: newCourseCode,
        label: `${newCourseCode} (${savedCategory})`,
        category: savedCategory,
      };

      setProfessorCourses((prev) => [...prev, newCourseItem]);
      setSelectedCourseCode(newCourseCode);
      setNewlyCreatedCode(newCourseCode);

      // Add clip to local state so professor sees it immediately
      const newClip: ProfessorVideoClip = {
        id: `vid-new-${Date.now()}`,
        courseCode: newCourseCode,
        courseTitle: savedTitle,
        category: savedCategory,
        title: materialTitle.trim() || `บทที่ 1: แนะนำรายวิชา ${savedTitle}`,
        description: savedDescription,
        durationText: '60:00 นาที',
        fileSizeText: uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(0)} MB` : '480 MB',
        uploadDate: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
        videoUrl: videoLinkUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        viewsCount: 0,
      };
      setExtraVideoClips((prev) => [...prev, newClip]);

      // Seed initial student for created course
      setCourseStudents((prev) => ({
        ...prev,
        [newCourseCode]: [
          {
            id: `att-${Date.now()}`,
            studentId: 'XK-65010999',
            name: 'สมเกียรติ ช่างใหม่',
            status: 'APPROVED',
          }
        ]
      }));

      // Re-fetch courses list from API
      fetch('/api/courses')
        .then((r) => r.json())
        .then((d) => {
          if (d.courses) setCourses(d.courses);
        })
        .catch(() => {});

      setCreateSuccessMsg(`⏳ ส่งรายวิชา "${savedTitle}" (${newCourseCode}) เพื่อรอผู้อนุมัติตรวจสอบแล้ว — กรุณารอการอนุมัติก่อนเผยแพร่ให้นักศึกษาเห็น`);
      setTimeout(() => setCreateSuccessMsg(null), 8000);

      // Reset form & close modal
      setNewCode('');
      setNewTitle('');
      setNewDescription('');
      setMaterialTitle('');
      setUploadedFile(null);
      setUploadedFileName(null);
      setVideoLinkUrl('');
      setHasGoogleFormsQuiz(false);
      setGoogleFormsUrl('');
      setCreateStep(1);
      setIsCreateModalOpen(false);

      // Scroll to courses section after short delay
      setTimeout(() => {
        coursesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);

      // Clear highlight after 5 seconds
      setTimeout(() => setNewlyCreatedCode(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const allStudents = React.useMemo(() => {
    // Interleave students from each branch with dedup by studentId or name
    const courseCodes = Object.keys(courseStudents);
    const maxLen = Math.max(...courseCodes.map((code) => (courseStudents[code] || []).length), 0);
    const list: any[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < maxLen; i++) {
      for (const code of courseCodes) {
        const s = courseStudents[code]?.[i];
        if (s) {
          // Use studentId as primary key, fallback to name (avoid using enrollment id which is always unique)
          const key = s.studentId && s.studentId !== 'XK-65010042' ? s.studentId : s.name;
          if (key && !seen.has(key)) {
            seen.add(key);
            list.push(s);
          }
        }
      }
    }
    // Cap at the canonical total to keep data consistent with the stats card
    return list.slice(0, BRANCH_STATS.ALL.enrolled);
  }, [courseStudents]);

  const currentCourse = courses.find((c) => c.code === selectedCourseCode);

  // For per-course view: deduplicate by studentId/name, then cap at BRANCH_STATS enrolled count
  const getRawStudents = (code: string) => {
    const raw = courseStudents[code] || [];
    const seen = new Set<string>();
    const deduped: any[] = [];
    for (const s of raw) {
      const key = s.studentId && s.studentId !== 'XK-65010042' ? s.studentId : s.name;
      if (key && !seen.has(key)) {
        seen.add(key);
        deduped.push(s);
      }
    }
    const cap = BRANCH_STATS[code]?.enrolled;
    return cap ? deduped.slice(0, cap) : deduped;
  };

  const currentStudents = selectedCourseCode === 'ALL'
    ? allStudents
    : getRawStudents(selectedCourseCode);

  const currentStats = BRANCH_STATS[selectedCourseCode] || {
    enrolled: currentStudents.length || 0,
    completed: Math.round((currentStudents.length || 0) * 0.88),
    rate: '88.0%',
  };

  const displayedStudents = showAllStudents ? currentStudents : currentStudents.slice(0, 8);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Header Banner for Teacher Portal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
        <div className="z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ผศ.ดร.วิชาญ สอนดี
          </h1>

        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Link
            href="/professor/classes"
            className="inline-flex items-center gap-2 rounded-full font-extrabold text-xs py-3 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md transition-all cursor-pointer"
          >
            <Video className="w-4 h-4 text-[#CEF34B]" />
            <span>คลาสที่เปิดสอน (คลิปวิดีโอ)</span>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4 text-black stroke-[3]" />}
            className="rounded-full font-extrabold text-xs py-3 px-6 bg-[#CEF34B] hover:bg-[#bce038] text-black shadow-lg border-0 transition-all transform hover:scale-105 whitespace-nowrap cursor-pointer"
          >
            สร้างรายวิชาใหม่
          </Button>
        </div>
      </div>

      {/* Pending Approval Notification Banner */}
      {createSuccessMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center gap-3 animate-fadeIn shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* Student Enrollment Requests Notification Banner */}
      {pendingEnrollmentsCount > 0 && (
        <div className="p-5 rounded-3xl bg-black text-white border-2 border-[#CEF34B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#CEF34B] text-black flex items-center justify-center font-bold flex-shrink-0">
              <Users className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#CEF34B] text-black text-[11px] font-black">
                  รออนุมัติ {pendingEnrollmentsCount} คน
                </span>
                <span className="text-xs text-slate-300">คำขอเข้าเรียนใหม่</span>
              </div>
              <p className="font-black text-base text-white mt-1">
                มีนักศึกษาขอเข้าร่วมเรียนรอการอนุมัติสิทธิ์ {pendingEnrollmentsCount} คน
              </p>
            </div>
          </div>
          <Link href="/course-approver">
            <button className="px-6 py-2.5 rounded-full bg-[#CEF34B] hover:bg-[#bce038] text-black font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <span>อนุมัติการเข้าเรียน ({pendingEnrollmentsCount} คน)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      )}

      {/* Metric Cards - Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/professor/classes" className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4 hover:border-slate-800 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center border border-slate-800 shadow-xs">
            <BookOpen className="w-6 h-6 text-[#CEF34B]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">คลาสที่เปิดสอน</p>
            <p className="text-xl font-extrabold text-slate-900">{professorCourses.length} คลาส</p>
            <p className="text-[10px] text-slate-500 font-bold">มหาวิทยาลัย Xการช่าง</p>
          </div>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">อัตราการเรียนจบโปรแกรม</p>
            <p className="text-xl font-extrabold text-emerald-600">95.4%</p>
            <p className="text-[10px] text-slate-500">ประเมินจากการเรียนครบ 100%</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">วิชาที่มีความสนใจสูงสุด</p>
            <p className="text-lg font-extrabold text-slate-900">CS101 (98%)</p>
            <p className="text-[10px] text-amber-600 font-bold">24,500 Material Views</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-xs">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">นักศึกษาในความดูแลทั้งหมด</p>
            <p className="text-xl font-extrabold text-slate-900">{BRANCH_STATS.ALL.enrolled.toLocaleString()} คน</p>
            <p className="text-[10px] text-slate-500">ข้อมูลจริงตามฐานข้อมูล</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: รายชื่อนักศึกษาที่ลงเรียน */}
      <div id="enrollment" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-900" />
            <span>ภาพรวมนักศึกษาที่เข้าเรียน</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">แสดงรายชื่อผู้เรียนทั้งหมดในความดูแล</p>
        </div>

        {/* Enrollment Summary Banner */}
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
            <span className="text-slate-500 font-semibold">นักศึกษาที่ลงเรียนทั้งหมด</span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentStats.enrolled.toLocaleString()} คน
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 shadow-xs text-white">
            <span className="text-[#CEF34B] font-bold">เรียนจบโปรแกรมแล้ว ({currentStats.rate})</span>
            <p className="text-2xl sm:text-3xl font-black text-[#CEF34B]">
              {currentStats.completed.toLocaleString()} คน
            </p>
          </div>
        </div>

        {/* Enrollment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 border-y border-slate-200 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6 w-16">#</th>
                <th className="p-4 w-44">รหัสประจำตัว</th>
                <th className="p-4">ชื่อนักศึกษา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 animate-fadeIn">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">
                    {isLoading ? 'กำลังโหลดข้อมูลนักศึกษา...' : 'ไม่พบบันทึกข้อมูลนักศึกษา'}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="p-4 font-mono font-extrabold text-slate-900">{log.studentId}</td>
                    <td className="p-4 font-bold text-slate-900">{log.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Expand / Collapse Button */}
        {currentStudents.length > 8 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 text-center">
            <button
              onClick={() => setShowAllStudents(!showAllStudents)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-[#CEF34B] font-extrabold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>
                {showAllStudents
                  ? 'ย่อรายชื่อ'
                  : `ดูรายชื่อทั้งหมด (${currentStudents.length.toLocaleString()} คน)`}
              </span>
              {showAllStudents ? (
                <ChevronUp className="w-4 h-4 text-[#CEF34B]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#CEF34B]" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: คลาสไหนที่นักเรียนสนใจ (Course Interest Analytics) */}
      <div id="interest" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-[#CEF34B] text-xs font-extrabold">
              Course Interest Analytics
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-900" />
            <span>รายงานวิเคราะห์: คลาสไหนที่นักเรียนสนใจเป็นพิเศษ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ข้อมูลความนิยมและสถิติการเปิดดูสื่อเรียนซ้ำของผู้เรียน มหาวิทยาลัย Xการช่าง
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {courseInterestData.map((item) => (
            <div
              key={item.code}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#CEF34B] text-black font-mono font-extrabold text-xs">
                    {item.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    {item.trend}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.category}</p>
              </div>

              {/* Interest Score Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>ระดับความสนใจของผู้เรียน</span>
                  <span className="text-slate-900 font-extrabold">{item.interestScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.interestScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-[11px]">สื่อที่มีการดูซ้ำสูงสุด:</p>
                <p className="text-[11px] text-slate-600 line-clamp-2">{item.topMaterial}</p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">ยอดเข้าชมสื่อ:</span>
                <span className="font-mono font-extrabold text-slate-900">{item.viewsCount.toLocaleString()} ครั้ง</span>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Create Course Modal Popup (2-Step Wizard) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={
          createStep === 1
            ? 'สร้างรายวิชาใหม่'
            : 'อัพโหลดสื่อการเรียน & แบบทดสอบ'
        }
        footer={
          createStep === 1 ? (
            <>
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                variant="primary"
                rightIcon={<ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />}
                className="rounded-xl bg-[#CEF34B] hover:bg-[#bce038] text-black text-xs font-extrabold shadow-md border-0 px-6 whitespace-nowrap"
                disabled={!newTitle.trim()}
                onClick={() => {
                  if (!newCode.trim()) {
                    setNewCode(`XK-${Math.floor(100 + Math.random() * 900)}`);
                  }
                  setCreateStep(2);
                }}
              >
                ถัดไป
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5 text-slate-600" />}
                className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap"
                onClick={() => setCreateStep(1)}
              >
                ย้อนกลับ
              </Button>
              <Button
                variant="primary"
                className="rounded-xl bg-[#CEF34B] hover:bg-[#bce038] text-black text-xs font-extrabold shadow-md border-0 px-6"
                isLoading={isSubmittingCourse}
                onClick={handleCreateCourseSubmit}
              >
                ส่งขออนุมัติรายวิชา
              </Button>
            </>
          )
        }
      >
        <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs font-sans">
          {createStep === 1 ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  ชื่อรายวิชา (Course Title) <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="ตัวอย่าง: ปัญญาประดิษฐ์ในงานช่างอุตสาหกรรม"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl text-xs bg-slate-50 border-slate-200"
                />
              </div>


              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  คำอธิบายรายวิชา (Course Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุรายละเอียดวัตถุประสงค์และขอบเขตการสอนของรายวิชานี้..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  นโยบายการเข้าเรียน (Access Policy)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="accessType"
                      value="APPROVAL_REQUIRED"
                      checked={newAccessType === 'APPROVAL_REQUIRED'}
                      onChange={() => setNewAccessType('APPROVAL_REQUIRED')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      คลาสแบบปิด (ต้องได้รับการอนุมัติ)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="accessType"
                      value="OPEN"
                      checked={newAccessType === 'OPEN'}
                      onChange={() => setNewAccessType('OPEN')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      เปิดทั่วไป (เข้าเรียนได้ทันที)
                    </span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Material & Quiz Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    เลือกประเภทไฟล์สื่อการเรียน (Material File Type)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMaterialType('VIDEO')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${materialType === 'VIDEO'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <Video className={`w-5 h-5 ${materialType === 'VIDEO' ? 'text-[#CEF34B]' : 'text-slate-500'}`} />
                      <div>
                        <p className="font-extrabold text-xs">วิดีโอการเรียน</p>
                        <p className={`text-[10px] ${materialType === 'VIDEO' ? 'text-slate-300' : 'text-slate-500'}`}>
                          MP4, WebM, MKV
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMaterialType('DOCUMENT')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${materialType === 'DOCUMENT'
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <FileText className={`w-5 h-5 ${materialType === 'DOCUMENT' ? 'text-[#CEF34B]' : 'text-slate-500'}`} />
                      <div>
                        <p className="font-extrabold text-xs">ไฟล์เอกสาร</p>
                        <p className={`text-[10px] ${materialType === 'DOCUMENT' ? 'text-slate-300' : 'text-slate-500'}`}>
                          PDF, DOCX, PPTX
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    ชื่อหัวข้อ / บทเรียน (Lesson Title)
                  </label>
                  <Input
                    placeholder={
                      materialType === 'VIDEO'
                        ? 'ตัวอย่าง: บทที่ 1: การติดตั้งและใช้งานเบื้องต้น'
                        : 'ตัวอย่าง: คู่มือปฏิบัติการและสไลด์ประกอบการสอน'
                    }
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-900">
                      แนบไฟล์สื่อการสอน ({materialType === 'VIDEO' ? 'Video File' : 'Document File'})
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      รองรับทุกไฟล์ ไม่เกิน 1 GB
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 rounded-2xl p-4 text-center transition-all relative">
                    <input
                      type="file"
                      accept={materialType === 'VIDEO' ? 'video/*,.mp4,.webm,.mkv,.mov,.avi,.m4v,.wmv,.flv' : '.pdf,.docx,.pptx'}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setUploadedFile(f);
                        setUploadedFileName(f?.name || null);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                    {uploadedFileName ? (
                      <div>
                        <p className="font-bold text-emerald-700 text-xs flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {uploadedFileName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">คลิกเพื่อเปลี่ยนไฟล์</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-700 text-xs">คลิกหรือลากไฟล์มาวางเพื่ออัพโหลด</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          รองรับทุกนามสกุลไฟล์ {materialType === 'VIDEO' ? '(MP4, WebM, MKV, MOV, AVI, WMV ฯลฯ)' : '(PDF, DOCX, PPTX)'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {materialType === 'VIDEO' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      หรือระบุลิงก์วิดีโอ (YouTube, Google Drive, Direct Video Link)
                    </label>
                    <Input
                      placeholder="เช่น https://www.youtube.com/watch?v=... หรือ https://drive.google.com/..."
                      value={videoLinkUrl}
                      onChange={(e) => setVideoLinkUrl(e.target.value)}
                      className="rounded-xl text-xs bg-slate-50 border-slate-200"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      * สามารถเลือกแนบไฟล์วิดีโอจากเครื่อง หรือใส่ลิงก์คลิปจาก YouTube / Google Drive ได้
                    </p>
                  </div>
                )}

                {/* Google Forms Post-Lesson Quiz Options */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={hasGoogleFormsQuiz}
                      onChange={(e) => setHasGoogleFormsQuiz(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 accent-slate-900"
                    />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                        มีแบบทดสอบหลังเรียนไหม? (ใช้ Google Forms)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        ติ๊กเลือกเพื่อใส่ลิงก์แบบทดสอบสำหรับนักศึกษาทำหลังเรียนเสร็จ
                      </p>
                    </div>
                  </label>

                  {hasGoogleFormsQuiz && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2 animate-fadeIn">
                      <label className="block text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                        ลิงก์แบบทดสอบ Google Forms (Google Forms URL) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        placeholder="https://forms.google.com/..."
                        value={googleFormsUrl}
                        onChange={(e) => setGoogleFormsUrl(e.target.value)}
                        className="rounded-xl text-xs bg-white border-indigo-200 focus:border-indigo-600"
                      />
                      <p className="text-[10px] text-indigo-700 font-medium">
                        * ระบบจะนำลิงก์ Google Forms นี้ไปแสดงในแถบแบบทดสอบหลังเรียนของนักศึกษาโดยเฉพาะ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Video Player Modal for Published Clips */}
      {activeVideoModal && (
        <Modal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          title={`คลาสที่เปิดสอน: ${activeVideoModal.courseCode} - ${activeVideoModal.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl">
              <VideoPlayer
                src={activeVideoModal.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                title={activeVideoModal.title}
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-[#CEF34B]">
                    {activeVideoModal.courseCode}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{activeVideoModal.category}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  ความยาว: {activeVideoModal.durationText} • ขนาดไฟล์: {activeVideoModal.fileSizeText}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">{activeVideoModal.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeVideoModal.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/80">
                <span>อาจารย์ผู้สอน: ผศ.ดร.วิชาญ สอนดี</span>
                <Link
                  href={`/learning/${activeVideoModal.courseCode.toLowerCase()}`}
                  className="inline-flex items-center gap-1 font-bold text-slate-900 hover:underline"
                >
                  <span>เข้าสู่ห้องเรียนเต็มรูปแบบ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ProfessorDashboard() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูลอาจารย์...</div>}>
      <ProfessorDashboardContent />
    </React.Suspense>
  );
}
