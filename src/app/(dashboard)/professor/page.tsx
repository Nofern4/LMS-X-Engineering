'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
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
    { id: 'cs-1', studentId: 'XK-65010042', name: 'สมชาย ช่างกล (Somchai)', status: 'APPROVED' },
    { id: 'cs-2', studentId: 'XK-65010101', name: 'ปิยะพงษ์ วิศวการ', status: 'APPROVED' },
    { id: 'cs-3', studentId: 'XK-65010102', name: 'กานดา โค้ดดิ้ง', status: 'APPROVED' },
    { id: 'cs-4', studentId: 'XK-65010103', name: 'ธีรภัทร ชิปเซ็ต', status: 'APPROVED' },
    { id: 'cs-5', studentId: 'XK-65010104', name: 'ชยพล เน็ตเวิร์ก', status: 'APPROVED' },
    { id: 'cs-6', studentId: 'XK-65010105', name: 'พัชราภรณ์ ดาต้าเบส', status: 'APPROVED' },
    { id: 'cs-7', studentId: 'XK-65010106', name: 'กฤษฎา ระบบฝังตัว', status: 'APPROVED' },
    { id: 'cs-8', studentId: 'XK-65010107', name: 'นภัสสร อัลกอริทึม', status: 'APPROVED' },
    { id: 'cs-9', studentId: 'XK-65010108', name: 'ธนวัฒน์ ปัญญาประดิษฐ์', status: 'APPROVED' },
    { id: 'cs-10', studentId: 'XK-65010109', name: 'รัชชานนท์ คลาวด์คอมพิวติ้ง', status: 'APPROVED' },
    { id: 'cs-11', studentId: 'XK-65010110', name: 'ศุภกานต์ ไซเบอร์ซีเคียวริตี้', status: 'APPROVED' },
    { id: 'cs-12', studentId: 'XK-65010111', name: 'มนัสวิน สถาปัตยกรรมคอมพ์', status: 'APPROVED' },
    { id: 'cs-13', studentId: 'XK-65010112', name: 'ฐิติพร วงจรดิจิทัล', status: 'APPROVED' },
    { id: 'cs-14', studentId: 'XK-65010113', name: 'พงศธร คอมไพเลอร์', status: 'APPROVED' },
    { id: 'cs-15', studentId: 'XK-65010114', name: 'ปวริศร์ โอเปอเรติงซิสเต็ม', status: 'APPROVED' },
  ],
  ME201: [
    { id: 'me-1', studentId: 'XK-65020042', name: 'สมศักดิ์ กลึงเหล็ก', status: 'APPROVED' },
    { id: 'me-2', studentId: 'XK-65020101', name: 'สุรชัย ช่างกลึง', status: 'APPROVED' },
    { id: 'me-3', studentId: 'XK-65020102', name: 'ธนพล ไฮดรอลิก', status: 'APPROVED' },
    { id: 'me-4', studentId: 'XK-65020103', name: 'วรวิทย์ นิวแมติกส์', status: 'APPROVED' },
    { id: 'me-5', studentId: 'XK-65020104', name: 'กิตติพงษ์ เขียนแบบช่าง', status: 'APPROVED' },
    { id: 'me-6', studentId: 'XK-65020105', name: 'ประสิทธิ์ งานเชื่อมโลหะ', status: 'APPROVED' },
    { id: 'me-7', studentId: 'XK-65020106', name: 'เจษฎา วัสดุวิศวกรรม', status: 'APPROVED' },
    { id: 'me-8', studentId: 'XK-65020107', name: 'ชานนท์ กลศาสตร์ของแข็ง', status: 'APPROVED' },
    { id: 'me-9', studentId: 'XK-65020108', name: 'เอกลักษณ์ เครื่องมือวัดละเอียด', status: 'APPROVED' },
    { id: 'me-10', studentId: 'XK-65020109', name: 'วุฒิภัทร โลหะวิทยา', status: 'APPROVED' },
    { id: 'me-11', studentId: 'XK-65020110', name: 'ธนาคาร ควบคุมซีเอ็นซี (CNC)', status: 'APPROVED' },
    { id: 'me-12', studentId: 'XK-65020111', name: 'อนุสรณ์ กรรมวิธีการผลิต', status: 'APPROVED' },
    { id: 'me-13', studentId: 'XK-65020112', name: 'ศรายุทธ ออกแบบชิ้นส่วนเครื่องกล', status: 'APPROVED' },
    { id: 'me-14', studentId: 'XK-65020113', name: 'ชาญณรงค์ ถ่ายโอนความร้อน', status: 'APPROVED' },
  ],
  EE305: [
    { id: 'ee-1', studentId: 'XK-65010088', name: 'สมศักดิ์ ไฟฟ้า (Somsak)', status: 'APPROVED' },
    { id: 'ee-2', studentId: 'XK-65030101', name: 'อนุสรณ์ หม้อแปลงไฟฟ้า', status: 'APPROVED' },
    { id: 'ee-3', studentId: 'XK-65030102', name: 'ศุภชัย พาวเวอร์ซิสเต็ม', status: 'APPROVED' },
    { id: 'ee-4', studentId: 'XK-65030103', name: 'เกียรติศักดิ์ วงจรไฟฟ้าแรงสูง', status: 'APPROVED' },
    { id: 'ee-5', studentId: 'XK-65030104', name: 'ปรเมษฐ์ ควบคุมมอเตอร์', status: 'APPROVED' },
    { id: 'ee-6', studentId: 'XK-65030105', name: 'วีรยุทธ รีเลย์ป้องกัน', status: 'APPROVED' },
    { id: 'ee-7', studentId: 'XK-65030106', name: 'สันติภาพ พลังงานหมุนเวียน', status: 'APPROVED' },
    { id: 'ee-8', studentId: 'XK-65030107', name: 'นพรัตน์ ติดตั้งไฟฟ้าอาคาร', status: 'APPROVED' },
    { id: 'ee-9', studentId: 'XK-65030108', name: 'ชวิน โปรแกรมเมเบิลลอจิก (PLC)', status: 'APPROVED' },
    { id: 'ee-10', studentId: 'XK-65030109', name: 'ก้องภพ ระบบส่งจ่ายกำลังไฟฟ้า', status: 'APPROVED' },
    { id: 'ee-11', studentId: 'XK-65030110', name: 'อัครเดช ตู้สวิตช์บอร์ด', status: 'APPROVED' },
    { id: 'ee-12', studentId: 'XK-65030111', name: 'สหรัฐ เครื่องกำเนิดไฟฟ้า', status: 'APPROVED' },
    { id: 'ee-13', studentId: 'XK-65030112', name: 'ธนากร อิเล็กทรอนิกส์กำลัง', status: 'APPROVED' },
  ],
  AUTO101: [
    { id: 'auto-1', studentId: 'XK-65040101', name: 'ประสิทธิ์ ช่างยนต์', status: 'APPROVED' },
    { id: 'auto-2', studentId: 'XK-65040102', name: 'ชาญวิทย์ เครื่องยนต์ดีเซล', status: 'APPROVED' },
    { id: 'auto-3', studentId: 'XK-65040103', name: 'ณัฐพงษ์ ระบบหัวฉีดอิเล็กทรอนิกส์', status: 'APPROVED' },
    { id: 'auto-4', studentId: 'XK-65040104', name: 'อภิสิทธิ์ กลไกส่งกำลัง', status: 'APPROVED' },
    { id: 'auto-5', studentId: 'XK-65040105', name: 'วัชรพงษ์ ยานยนต์ไฟฟ้า (EV)', status: 'APPROVED' },
    { id: 'auto-6', studentId: 'XK-65040106', name: 'พิเชษฐ์ ช่วงล่างและเบรก', status: 'APPROVED' },
    { id: 'auto-7', studentId: 'XK-65040107', name: 'บรรพต ระบบปรับอากาศยานยนต์', status: 'APPROVED' },
    { id: 'auto-8', studentId: 'XK-65040108', name: 'ภูริช ช่างเครื่องยนต์เบนซิน', status: 'APPROVED' },
    { id: 'auto-9', studentId: 'XK-65040109', name: 'ชลิต ระบบไฮบริด', status: 'APPROVED' },
    { id: 'auto-10', studentId: 'XK-65040110', name: 'สิทธิชัย แบตเตอรี่กำลังสูง', status: 'APPROVED' },
    { id: 'auto-11', studentId: 'XK-65040111', name: 'อดิศร ตรวจวินิจฉัย OBD-II', status: 'APPROVED' },
    { id: 'auto-12', studentId: 'XK-65040112', name: 'เมธาสิทธิ์ วิศวกรรมระบบขับเคลื่อน', status: 'APPROVED' },
  ],
  SE302: [
    { id: 'se-1', studentId: 'XK-65050101', name: 'วรัญญา สถาปัตยกรรมซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-2', studentId: 'XK-65050102', name: 'ธนภัทร ไมโครเซอร์วิส', status: 'APPROVED' },
    { id: 'se-3', studentId: 'XK-65050103', name: 'ศรุต คลีนโค้ด', status: 'APPROVED' },
    { id: 'se-4', studentId: 'XK-65050104', name: 'อภิวัฒน์ เดฟออปส์ (DevOps)', status: 'APPROVED' },
    { id: 'se-5', studentId: 'XK-65050105', name: 'ชญาดา ควบคุมคุณภาพซอฟต์แวร์', status: 'APPROVED' },
    { id: 'se-6', studentId: 'XK-65050106', name: 'ภานุมาศ ฟูลสแต็ก', status: 'APPROVED' },
    { id: 'se-7', studentId: 'XK-65050107', name: 'ภูวดล สแครมมาสเตอร์', status: 'APPROVED' },
    { id: 'se-8', studentId: 'XK-65050108', name: 'ศิรชัช ระบบกระจายงาน', status: 'APPROVED' },
    { id: 'se-9', studentId: 'XK-65050109', name: 'กมลชนก คลาวด์เนทีฟ', status: 'APPROVED' },
    { id: 'se-10', studentId: 'XK-65050110', name: 'อัศวิน ทดสอบระบบอัตโนมัติ', status: 'APPROVED' },
    { id: 'se-11', studentId: 'XK-65050111', name: 'พิชญ์พงศ์ ซอฟต์แวร์ซิเคียวริตี้', status: 'APPROVED' },
    { id: 'se-12', studentId: 'XK-65050112', name: 'ชาคริต วิศวกรรมข้อมูลขนาดใหญ่', status: 'APPROVED' },
  ],
};

const BRANCH_STATS: Record<string, { enrolled: number; completed: number; rate: string }> = {
  ALL: { enrolled: 854, completed: 746, rate: '87.4%' },
  CS101: { enrolled: 245, completed: 218, rate: '89.0%' },
  ME201: { enrolled: 182, completed: 156, rate: '85.7%' },
  EE305: { enrolled: 164, completed: 142, rate: '86.6%' },
  AUTO101: { enrolled: 138, completed: 120, rate: '87.0%' },
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
    id: 'vid-auto-1',
    courseCode: 'AUTO101',
    courseTitle: 'เทคโนโลยีช่างยนต์และระบบส่งกำลัง (Automotive Technology)',
    category: 'เทคโนโลยีช่างยนต์',
    title: 'บทที่ 1: พื้นฐานระบบเครื่องยนต์สันดาปภายในและการวินิจฉัยปัญหา',
    description: 'หลักการทำงาน 4 จังหวะของเครื่องยนต์เบนซินและดีเซล, ระบบวาล์ว, ระบบหล่อลื่น และการใช้เครื่องสแกน OBD-II',
    durationText: '50:00 นาที',
    fileSizeText: '460 MB',
    uploadDate: '2 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    viewsCount: 710,
  },
  {
    id: 'vid-auto-2',
    courseCode: 'AUTO101',
    courseTitle: 'เทคโนโลยีช่างยนต์และระบบส่งกำลัง (Automotive Technology)',
    category: 'เทคโนโลยีช่างยนต์',
    title: 'บทที่ 2: ระบบยานยนต์ไฟฟ้า EV และแบตเตอรี่แรงดันสูง (High-Voltage Battery)',
    description: 'ระบบขับเคลื่อนมอเตอร์ไฟฟ้า (Inverter & Traction Motor), เซลล์แบตเตอรี่ และมาตรฐานความปลอดภัยในงานช่างยานยนต์ EV',
    durationText: '60:00 นาที',
    fileSizeText: '530 MB',
    uploadDate: '8 ก.ย. 2026',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    viewsCount: 890,
  },
];

function ProfessorDashboardContent() {
  const [courses, setCourses] = useState<any[]>([]);
  const [courseStudents, setCourseStudents] = useState<Record<string, any[]>>(DEFAULT_BRANCH_STUDENTS);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('ALL');
  const [showAllStudents, setShowAllStudents] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Video clips filter & active preview modal state
  const [selectedVideoCourseFilter, setSelectedVideoCourseFilter] = useState<string>('ALL');
  const [activeVideoModal, setActiveVideoModal] = useState<ProfessorVideoClip | null>(null);

  // Professor Taught Courses Selector List
  const [professorCourses, setProfessorCourses] = useState([
    { code: 'CS101', label: 'CS101 (วิศวกรรมคอมพิวเตอร์)', category: 'วิศวกรรมคอมพิวเตอร์' },
    { code: 'SE302', label: 'SE302 (วิศวกรรมซอฟต์แวร์)', category: 'วิศวกรรมซอฟต์แวร์' },
    { code: 'ME201', label: 'ME201 (ช่างกลโรงงาน)', category: 'ช่างกลโรงงาน' },
    { code: 'EE305', label: 'EE305 (ช่างไฟฟ้ากำลัง)', category: 'ช่างไฟฟ้ากำลัง' },
    { code: 'AUTO101', label: 'AUTO101 (เทคโนโลยีช่างยนต์)', category: 'เทคโนโลยีช่างยนต์' },
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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
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
    setUploadedFileName(null);
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
      if (!newCode.trim() || !newTitle.trim()) return;
      setCreateStep(2);
      return;
    }

    setIsSubmittingCourse(true);
    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: 'prof-1', roles: ['PROFESSOR'] },
          code: newCode.trim(),
          title: newTitle.trim(),
          description: newDescription.trim() || 'รายวิชาใหม่ประจำภาคเรียน',
          category: newCategory,
          semester: '1',
          academicYear: '2026',
          accessType: newAccessType,
          storageLimitGb: '1.0',
        }),
      });

      const newCourseCode = newCode.trim();
      const newCourseItem = {
        code: newCourseCode,
        label: `${newCourseCode} (${newCategory})`,
        category: newCategory,
      };

      setProfessorCourses((prev) => [...prev, newCourseItem]);
      setSelectedCourseCode(newCourseCode);

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

      setCreateSuccessMsg(`สร้างรายวิชา ${newCourseCode} - ${newTitle.trim()} พร้อมสื่อเรียนสำเร็จแล้ว!`);
      setTimeout(() => setCreateSuccessMsg(null), 4000);

      // Reset form & close modal
      setNewCode('');
      setNewTitle('');
      setNewDescription('');
      setCreateStep(1);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const allStudents = React.useMemo(() => {
    // Interleave students from each branch so "ทั้งหมด" displays a rich mix across branches
    const courseCodes = Object.keys(courseStudents);
    const maxLen = Math.max(...courseCodes.map((code) => (courseStudents[code] || []).length), 0);
    const list: any[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < maxLen; i++) {
      for (const code of courseCodes) {
        const s = courseStudents[code]?.[i];
        if (s) {
          const key = s.studentId || s.id || s.name;
          if (key && !seen.has(key)) {
            seen.add(key);
            list.push(s);
          }
        }
      }
    }
    return list;
  }, [courseStudents]);

  const currentCourse = courses.find((c) => c.code === selectedCourseCode);
  const currentStudents = selectedCourseCode === 'ALL'
    ? allStudents
    : (courseStudents[selectedCourseCode] || []);
  
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
        <div className="space-y-1 z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ผศ.ดร.วิชาญ สอนดี
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            แดชบอร์ดข้อมูลการเรียนการสอน • สำหรับอาจารย์และบุคลากรสถาบัน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <a
            href="#classes-offered"
            className="rounded-full font-extrabold text-xs py-3 px-5 bg-white/10 hover:bg-white/20 text-[#CEF34B] border border-white/10 hover:border-[#CEF34B]/50 transition-all flex items-center gap-2 cursor-pointer shadow-md transform hover:scale-105"
          >
            <Video className="w-4 h-4 text-[#CEF34B]" />
            <span>คลาสที่เปิดสอน ({PROFESSOR_VIDEO_CLIPS.length} คลิป)</span>
          </a>

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

      {/* Success Notification Banner */}
      {createSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* Metric Cards - Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center border border-slate-800 shadow-xs">
            <BookOpen className="w-6 h-6 text-[#CEF34B]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">รายวิชาที่สอน</p>
            <p className="text-xl font-extrabold text-slate-900">{professorCourses.length} รายวิชา</p>
            <p className="text-[10px] text-slate-500 font-bold">มหาวิทยาลัย Xการช่าง</p>
          </div>
        </div>

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
            <p className="text-xl font-extrabold text-slate-900">854 คน</p>
            <p className="text-[10px] text-slate-500">ข้อมูลจริงตามฐานข้อมูล</p>
          </div>
        </div>
      </div>

      {/* SECTION: คลาสที่เปิดสอน (คลิปวิดีโอที่อาจารย์เคยลง) */}
      <div id="classes-offered" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>คลาสที่เปิดสอน</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#CEF34B] text-black border border-[#bce038]">
                  {selectedVideoCourseFilter === 'ALL'
                    ? `${PROFESSOR_VIDEO_CLIPS.length} คลิปวิดีโอ`
                    : `${PROFESSOR_VIDEO_CLIPS.filter((v) => v.courseCode === selectedVideoCourseFilter).length} คลิปวิดีโอ`}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                สื่อวิดีโอบทเรียนที่ ผศ.ดร.วิชาญ สอนดี ได้บันทึกและเผยแพร่ในแต่ละรายวิชา
              </p>
            </div>
          </div>

          {/* Video Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSelectedVideoCourseFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedVideoCourseFilter === 'ALL'
                  ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                  : 'text-slate-700 hover:text-black bg-white/60'
              }`}
            >
              ทั้งหมด ({PROFESSOR_VIDEO_CLIPS.length})
            </button>
            {['CS101', 'EE305', 'SE302', 'AUTO101'].map((code) => {
              const count = PROFESSOR_VIDEO_CLIPS.filter((v) => v.courseCode === code).length;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedVideoCourseFilter(code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedVideoCourseFilter === code
                      ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                      : 'text-slate-700 hover:text-black bg-white/60'
                  }`}
                >
                  {code} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(selectedVideoCourseFilter === 'ALL'
            ? PROFESSOR_VIDEO_CLIPS
            : PROFESSOR_VIDEO_CLIPS.filter((v) => v.courseCode === selectedVideoCourseFilter)
          ).map((clip) => (
            <div
              key={clip.id}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Video Thumbnail Preview Header */}
                <div
                  onClick={() => setActiveVideoModal(clip)}
                  className="h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 relative flex flex-col justify-between text-white cursor-pointer group-hover:brightness-105 transition-all overflow-hidden"
                >
                  {/* Subtle Grid Accent */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />

                  {/* Top Badges */}
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/60 text-[#CEF34B] border border-[#CEF34B]/30 backdrop-blur-md">
                      {clip.courseCode} • {clip.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#CEF34B]" />
                      {clip.durationText}
                    </span>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="flex items-center justify-center my-auto z-10">
                    <div className="w-12 h-12 rounded-full bg-[#CEF34B] text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-5 h-5 ml-0.5 fill-black text-black" />
                    </div>
                  </div>

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 z-10">
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      อนุมัติเผยแพร่แล้ว
                    </span>
                    <span className="text-slate-400">{clip.fileSizeText}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                    {clip.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {clip.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(clip)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-[#CEF34B] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-[#CEF34B]" />
                  <span>เปิดดูคลิปวิดีโอ</span>
                </button>
                <Link
                  href={`/learning/${clip.courseCode.toLowerCase()}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  title="ไปที่ห้องเรียน"
                >
                  <span>ห้องเรียน</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: รายชื่อนักศึกษาที่ลงเรียน */}
      <div id="enrollment" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-slate-900" />
              <span>
                รายชื่อนักศึกษาที่ลงเรียน{' '}
                {selectedCourseCode === 'ALL'
                  ? '- ทั้งหมด'
                  : `- ${selectedCourseCode} (${professorCourses.find((c) => c.code === selectedCourseCode)?.category || selectedCourseCode})`}
              </span>
            </h2>
          </div>

          {/* Select Course Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              id="branch-btn-ALL"
              key="ALL"
              onClick={() => {
                setSelectedCourseCode('ALL');
                setShowAllStudents(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedCourseCode === 'ALL'
                  ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                  : 'text-slate-700 hover:text-black bg-white/60'
              }`}
            >
              ทั้งหมด
            </button>
            {professorCourses.map((c) => (
              <button
                id={`branch-btn-${c.code}`}
                key={c.code}
                onClick={() => {
                  setSelectedCourseCode(c.code);
                  setShowAllStudents(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCourseCode === c.code
                    ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                    : 'text-slate-700 hover:text-black bg-white/60'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enrollment Summary Banner for Selected Course (Dynamic per Branch / All) */}
        <div key={`metrics-card-${selectedCourseCode}`} className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
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

        {/* Enrollment Table (Showing only Student ID & Name, No branch, No completion tags) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 border-y border-slate-200 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 pl-6 w-16">#</th>
                <th className="p-4 w-44">รหัสประจำตัว</th>
                <th className="p-4">ชื่อนักศึกษา</th>
              </tr>
            </thead>
            <tbody key={`table-body-${selectedCourseCode}`} className="divide-y divide-slate-100 animate-fadeIn">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">
                    {isLoading ? 'กำลังโหลดข้อมูลนักศึกษา...' : `ไม่พบบันทึกการลงเรียนในรายวิชาที่เลือก (${selectedCourseCode})`}
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
                disabled={!newCode.trim() || !newTitle.trim()}
                onClick={() => setCreateStep(2)}
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
                บันทึกสร้างรายวิชาและบทเรียน
              </Button>
            </>
          )
        }
      >
        <form onSubmit={handleCreateCourseSubmit} className="space-y-4 text-xs font-sans">
          {createStep === 1 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    รหัสวิชา (Course Code) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="ตัวอย่าง: CS103, EE401"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    ชื่อรายวิชา (Course Title) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="ตัวอย่าง: ปัญญาประดิษฐ์ในงานช่าง"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-xl text-xs bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  หมวดหมู่รายวิชา (ทุกสาขาวิชาเรียนได้)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900"
                >
                  <option value="ทั่วไป (เปิดกว้างทุกสาขาวิชา)">ทั่วไป (เปิดกว้างทุกสาขาวิชาเรียนได้)</option>
                  <option value="วิชาแกนวิศวกรรม/ช่างอุตสาหกรรม">วิชาแกนวิศวกรรม/ช่างอุตสาหกรรม (เปิดทุกสาขา)</option>
                  <option value="วิชาเลือกเสรี">วิชาเลือกเสรี (เปิดทุกสาขา)</option>
                  <option value="วิชาปฏิบัติการและโครงงาน">วิชาปฏิบัติการและโครงงาน (เปิดทุกสาขา)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  * ทุกรายวิชาเปิดกว้างให้นักศึกษาทุกสาขาวิชาเข้าเรียนได้ หรือยื่นขออนุมัติได้โดยไม่มีการจำกัดเฉพาะสาขา
                </p>
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
                      จำกัดขนาดไฟล์ไม่เกิน 1 GB
                    </span>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 rounded-2xl p-4 text-center transition-all relative">
                    <input
                      type="file"
                      accept={materialType === 'VIDEO' ? 'video/*' : '.pdf,.docx,.pptx'}
                      onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name || null)}
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
                          รองรับไฟล์ {materialType === 'VIDEO' ? 'MP4 / WebM' : 'PDF / DOCX'} (สูงสุดไม่เกิน 1 GB ต่อไฟล์)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

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
