'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlayCircle,
  FileText,
  Download,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Zap,
  MessageSquare,
  PlusCircle,
  Share2,
  Lock,
  Search,
  Clock,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Info,
  ArrowRight,
  ExternalLink,
  Award,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface QAItem {
  id: string;
  user: string;
  question: string;
  replies: number;
  timeAgo: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const COURSE_QUIZZES: Record<string, QuizQuestion[]> = {
  CS101: [
    {
      id: 'cs1',
      question: 'การทำงานของคอมไพเลอร์ (Compiler) ต่างจากอินเทอร์พรีเตอร์ (Interpreter) อย่างไร?',
      options: [
        'คอมไพเลอร์แปลโค้ดทั้งหมดเป็น Machine Code ก่อนทำงาน ส่วนอินเทอร์พรีเตอร์แปลทีละบรรทัดขณะรัน',
        'คอมไพเลอร์ใช้สำหรับเล่นเกมเท่านั้น',
        'อินเทอร์พรีเตอร์ทำงานได้เร็วกว่าคอมไพเลอร์เสมอในทุกกรณี',
        'ทั้งสองระบบไม่มีความแตกต่างกัน'
      ],
      correctAnswer: 0,
      explanation: 'Compiler แปลง source code ทั้งหมดเป็นไบนารีที่เครื่องเข้าใจก่อนรัน ทำให้ประมวลผลได้รวดเร็ว ส่วน Interpreter แปลและประมวลผลไปทีละบรรทัด'
    },
    {
      id: 'cs2',
      question: 'การประกาศตัวแปร Pointer (เช่น int *ptr) ในภาษา C/C++ มีวัตถุประสงค์หลักเพื่ออะไร?',
      options: [
        'ใช้เก็บที่อยู่หน่วยความจำ (Memory Address) ของตัวแปรอื่น',
        'ใช้สำหรับล้างฮาร์ดดิสก์ของเครื่อง',
        'ทำให้โปรแกรมมีขนาดใหญ่ขึ้น 10 เท่า',
        'ใช้แทนตัวพิมพ์ใหญ่ในข้อความ'
      ],
      correctAnswer: 0,
      explanation: 'Pointer ในภาษา C/C++ ใช้สำหรับเก็บ Address ของ Memory ช่วยให้เข้าถึงและจัดการหน่วยความจำได้อย่างรวดเร็วและมีประสิทธิภาพ'
    },
    {
      id: 'cs3',
      question: 'โครงสร้างข้อมูลแบบ Array มีลักษณะเด่นที่สำคัญอย่างไร?',
      options: [
        'เก็บข้อมูลชนิดเดียวกันในหน่วยความจำที่เรียงต่อกัน เข้าถึงข้อมูลผ่าน Index ด้วยความเร็ว O(1)',
        'ไม่สามารถระบุขนาดข้อมูลได้',
        'ค้นหาข้อมูลได้ช้าที่สุดในระบบ',
        'ใช้เก็บเฉพาะรูปภาพเท่านั้น'
      ],
      correctAnswer: 0,
      explanation: 'Array เก็บข้อมูลชนิดเดียวกันในตำแหน่งหน่วยความจำที่ต่อเนื่องกัน ทำให้สามารถสุ่มเข้าถึง (Random Access) ผ่านดัชนีได้ทันทีในเวลาคงที่ O(1)'
    }
  ],
  EE305: [
    {
      id: 'ee1',
      question: 'อุปกรณ์ใดทำหน้าที่ตัดวงจรไฟฟ้าอัตโนมัติเมื่อตรวจพบกระแสไฟฟ้าไหลเกิน (Overload) เพื่อป้องกันมอเตอร์เสียหาย?',
      options: [
        'Thermal Overload Relay',
        'หลอดไฟสัญญาณ Pilot Lamp',
        'สายดิน Ground Wire',
        'สวิตช์ปุ่มกด Push Button'
      ],
      correctAnswer: 0,
      explanation: 'Thermal Overload Relay จะตรวจจับความร้อนจากกระแสเกินและสั่งทริปหน้าสัมผัสตัดวงจรควบคุมคอยล์ของ Magnetic Contactor ทันที'
    },
    {
      id: 'ee2',
      question: 'ภาษา Ladder Diagram นิยมใช้ในการเขียนโปรแกรมอุปกรณ์ใดในโรงงานอุตสาหกรรม?',
      options: [
        'Programmable Logic Controller (PLC)',
        'เครื่องเล่นแผ่นเสียง',
        'เครื่องพิมพ์เอกสารทั่วไป',
        'จอแสดงผลโทรทัศน์'
      ],
      correctAnswer: 0,
      explanation: 'Ladder Diagram เป็นภาษามาตรฐานที่พัฒนามาจากวงจรรีเลย์ไฟฟ้าเพื่อให้ช่างไฟฟ้าและวิศวกรเข้าใจตรรกะการควบคุม PLC ได้ง่าย'
    },
    {
      id: 'ee3',
      question: 'โปรโตคอล MQTT ในระบบ IoT อุตสาหกรรมทำงานด้วยรูปแบบใดเป็นหลัก?',
      options: [
        'Publish / Subscribe ผ่านตัวกลาง Broker ที่ใช้แบนด์วิดท์ต่ำและน้ำหนักเบา',
        'ส่งจดหมายอิเล็กทรอนิกส์ผ่าน SMTP เท่านั้น',
        'เปิดไฟล์ผ่าน Flash Drive โดยตรง',
        'สตรีมวิดีโอ 8K ตลอดเวลา'
      ],
      correctAnswer: 0,
      explanation: 'MQTT ออกแบบมาสำหรับอุปกรณ์ IoT ที่มีทรัพยากรจำกัด โดยใช้สถาปัตยกรรม Pub/Sub ผ่าน Broker ทำให้ส่งข้อมูลเซนเซอร์ได้อย่างรวดเร็วและประหยัดพลังงาน'
    }
  ],
  SE302: [
    {
      id: 'se1',
      question: 'หลักการ Dependency Inversion Principle (DIP) ใน Clean Architecture มุ่งเน้นสิ่งใด?',
      options: [
        'โมดูลระดับสูง (Business Logic) ต้องไม่ขึ้นอยู่กับโมดูลระดับต่ำ แต่ทั้งคู่ต้องขึ้นอยู่กับ Abstraction/Interface',
        'ให้เขียนโค้ดทั้งหมดลงในไฟล์เดียว',
        'ยกเลิกการใช้ฐานข้อมูลทั้งหมดในระบบ',
        'กำหนดให้เซิร์ฟเวอร์ต้องรีสตาร์ตทุกชั่วโมง'
      ],
      correctAnswer: 0,
      explanation: 'DIP ช่วยลดความผูกมัด (Decoupling) ของระบบ โดยทำให้ Business Core เป็นอิสระจาก Framework, Database หรือ UI ภายนอก'
    },
    {
      id: 'se2',
      question: 'Saga Pattern ในสถาปัตยกรรม Microservices ใช้แก้ปัญหาใดเป็นหลัก?',
      options: [
        'การจัดการธุรกรรมแบบกระจาย (Distributed Transactions) ข้ามหลายเซอร์วิสโดยไม่ต้องใช้ 2-Phase Commit',
        'การเปลี่ยนสีธีมของเว็บไซต์',
        'การแปลงไฟล์ภาพเป็น PDF',
        'การบล็อกการเชื่อมต่ออินเทอร์เน็ต'
      ],
      correctAnswer: 0,
      explanation: 'Saga Pattern จัดการความสอดคล้องของข้อมูลในระบบกระจายตัวผ่านชุดของ Local Transactions และมี Compensating Transactions กรณีที่ขั้นตอนใดขั้นตอนหนึ่งล้มเหลว'
    },
    {
      id: 'se3',
      question: 'เทคนิค Database Sharding เหมาะสำหรับกรณีใดมากที่สุด?',
      options: [
        'เมื่อปริมาณข้อมูลและการเขียน (Write Throughput) เกินขีดจำกัดที่เซิร์ฟเวอร์เครื่องเดียวจะรับไหว จึงแยกตารางออกเป็นหลายฐานข้อมูล',
        'เมื่อมีผู้ใช้ระบบเพียง 1 คน',
        'ใช้เพื่อลดความเร็วของฐานข้อมูล',
        'ใช้แทนการสำรองข้อมูลรายวัน'
      ],
      correctAnswer: 0,
      explanation: 'Database Sharding เป็นการทำ Horizontal Partitioning เพื่อกระจายข้อมูลและทราฟฟิกไปยังหลายเครื่องเซิร์ฟเวอร์ รองรับสเกลระดับใหญ่'
    }
  ],
  AI401: [
    {
      id: 'ai1',
      question: 'ปัญหา Overfitting ในการเทรนโมเดล Machine Learning มีลักษณะอย่างไร?',
      options: [
        'โมเดลทำคะแนนได้ดีมากบน Training Data แต่ทำนายบน Test Data หรือข้อมูลใหม่ได้แย่ (ขาด Generalization)',
        'โมเดลไม่สามารถเปิดโปรแกรมขึ้นมาได้',
        'โมเดลคำนวณเลขบวกลบผิดพลาด',
        'โมเดลทำงานได้ถูกต้อง 100% กับทุกข้อมูลในโลก'
      ],
      correctAnswer: 0,
      explanation: 'Overfitting เกิดจากการที่โมเดลจดจำสัญญาณรบกวน (Noise) ในชุดข้อมูลฝึกฝนมากเกินไป วิธีแก้คือการใช้ Regularization, Dropout หรือเพิ่มข้อมูล'
    },
    {
      id: 'ai2',
      question: 'ขั้นตอน Backpropagation ในโครงข่ายประสาทเทียม (Deep Learning) ทำหน้าที่อะไร?',
      options: [
        'คำนวณ Gradient ของ Loss Function ย้อนกลับเพื่ออัปเดตค่าน้ำหนัก (Weights) ของเครือข่าย',
        'ลบข้อมูลทั้งหมดทิ้งเพื่อเริ่มใหม่',
        'บันทึกภาพหน้าจอขณะเทรนโมเดล',
        'ส่งข้อความแจ้งเตือนผ่าน SMS'
      ],
      correctAnswer: 0,
      explanation: 'Backpropagation ใช้กฎลูกโซ่ (Chain Rule) ในการคำนวณความชันความผิดพลาดส่งกลับจาก Output Layer สู่ Input Layer เพื่อให้ Optimizer ปรับค่าน้ำหนักลด Loss ลง'
    },
    {
      id: 'ai3',
      question: 'Convolutional Neural Network (CNN) เหมาะสมกับการประมวลผลข้อมูลประเภทใดมากที่สุด?',
      options: [
        'ข้อมูลภาพและพิกัดเชิงพื้นที่ (Images & Spatial Data)',
        'ไฟล์เสียงเพลงความยาว 10 ชั่วโมงแบบไม่มีจังหวะ',
        'ข้อความสั้น 1 ตัวอักษร',
        'ตารางสเปรดชีตเปล่า'
      ],
      correctAnswer: 0,
      explanation: 'CNN ใช้ Kernel/Filter กวาดจับคุณลักษณะเฉพาะในภาพ (Edges, Textures, Shapes) ซึ่งมี Spatial Invariance ทำให้มีประสิทธิภาพสูงมากในงาน Computer Vision'
    }
  ]
};

export default function MaterialLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'quiz'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState<Record<string, boolean>>({});

  const courseCode = course?.code || (
    id === 'course-1' ? 'CS101' :
    id === 'course-2' ? 'ME201' :
    id === 'course-3' ? 'EE305' :
    id === 'course-4' ? 'AUTO101' :
    id === 'course-5' ? 'SE302' :
    id === 'course-6' ? 'AI401' : ''
  );

  const isSeedCourse = ['CS101', 'ME201', 'EE305', 'AUTO101', 'SE302', 'AI401'].includes(courseCode) ||
    ['course-1', 'course-2', 'course-3', 'course-4', 'course-5', 'course-6'].includes(id);

  // Instructor curriculum rules:
  // 1. ME201: ONLY documents, NO videos, NO quiz
  // 2. SE302: Videos + Quiz, NO documents
  // 3. AUTO101: Videos + Documents, NO quiz
  // 4. CS101, EE305, AI401: Full package
  // 5. Custom / user-created courses: hasQuiz ONLY if explicitly ticked (course.hasQuiz or course.quizUrl)
  const hasVideos = isSeedCourse ? (courseCode !== 'ME201' && id !== 'course-2') : true;
  const hasDocuments = isSeedCourse ? (courseCode !== 'SE302' && id !== 'course-5') : true;
  const hasQuiz = isSeedCourse
    ? (courseCode !== 'AUTO101' && courseCode !== 'ME201' && id !== 'course-4' && id !== 'course-2')
    : Boolean(course?.hasQuiz || course?.quizUrl);

  // null = ยังไม่รู้ (กำลังโหลด), true = เข้าได้, false = ปิดและยังไม่ได้รับอนุมัติ
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  const [isVideoFinished, setIsVideoFinished] = useState(true);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // For seed courses use seed questions, but NEVER force CS101 on custom courses without quizzes
  const currentQuizQuestions: QuizQuestion[] = COURSE_QUIZZES[courseCode] || [];

  const fetchCourseData = () => {
    fetch(`/api/courses/${id}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then((r) => r.json())
      .then((data) => {
        const c = data.course;
        if (!c) return;
        setCourse(c);

        if (c?.materials?.length > 0) {
          setActiveMaterial((prev: any) => prev || c.materials[0]);
          setCompletedMaterials((prev) => ({ ...prev, [c.materials[0].id]: true }));
        }

        const userSessionStr = typeof window !== 'undefined' 
          ? (localStorage.getItem('user_session') || localStorage.getItem('user')) 
          : null;
        const currentUser = userSessionStr ? (() => { try { return JSON.parse(userSessionStr); } catch { return null; } })() : null;

        const demoEmail = typeof window !== 'undefined' ? localStorage.getItem('demo_user_email') : null;
        const userEmail = currentUser?.email || demoEmail || 'student@student.x-karchang.ac.th';

        // Check if staff, instructor, approver, admin
        const isStaffOrApprover = Boolean(
          currentUser?.roles?.some((r: string) =>
            ['PROFESSOR', 'ADMIN', 'DIRECTOR', 'CONTENT_APPROVER', 'COURSE_CREATOR_APPROVER', 'REGISTRAR'].includes(r)
          ) ||
          userEmail === 'course.approver@x-karchang.ac.th' ||
          userEmail === 'professor@x-karchang.ac.th' ||
          userEmail === 'admin@x-karchang.ac.th' ||
          userEmail === 'director@x-karchang.ac.th'
        );

        if (isStaffOrApprover || c?.accessType === 'OPEN' || c?.accessType === 'PUBLIC') {
          setIsApproved(true);
          setEnrollmentStatus('APPROVED');
        } else {
          // Check student enrollments
          const enrollments: any[] = c?.enrollments || [];
          const myEnrollment = enrollments.find((e: any) =>
            (e.student?.email && e.student.email.toLowerCase() === userEmail.toLowerCase()) ||
            (currentUser?.id && (e.studentId === currentUser.id || e.student?.id === currentUser.id)) ||
            (userEmail.toLowerCase().includes('student') && e.student?.email?.toLowerCase().includes('student'))
          );

          if (myEnrollment) {
            setEnrollmentStatus(myEnrollment.status);
            setIsApproved(myEnrollment.status === 'APPROVED');
          } else {
            setIsApproved(false);
            setEnrollmentStatus('NONE');
          }
        }

        // Check if quiz already completed
        if (typeof window !== 'undefined') {
          const savedQuiz = localStorage.getItem(`course_quiz_${c?.code || id}`);
          if (savedQuiz) {
            try {
              const parsed = JSON.parse(savedQuiz);
              setQuizScore(parsed.score);
              setIsQuizSubmitted(true);
            } catch (e) {}
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCourseData();

    const handleUpdate = () => {
      fetchCourseData();
    };

    window.addEventListener('enrollment_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('enrollment_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [id]);


  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (isQuizSubmitted) return;
    let correctCount = 0;
    currentQuizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    setQuizScore(correctCount);
    setIsQuizSubmitted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`course_quiz_${courseCode || id}`, JSON.stringify({
        score: correctCount,
        total: currentQuizQuestions.length,
        submittedAt: Date.now()
      }));
    }
  };

  const formatFileSize = (bytes: any) => {
    if (!bytes) return '15.4 MB';
    const num = Number(bytes);
    if (num > 1024 * 1024 * 1024) return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [isEnrollingDirect, setIsEnrollingDirect] = useState(false);
  const handleEnrollFromLearningPage = async () => {
    setIsEnrollingDirect(true);
    setEnrollmentStatus('PENDING');
    try {
      const userEmail = typeof window !== 'undefined'
        ? (localStorage.getItem('demo_user_email') || 'student@student.x-karchang.ac.th')
        : 'student@student.x-karchang.ac.th';

      const userSessionStr = typeof window !== 'undefined'
        ? (localStorage.getItem('user_session') || localStorage.getItem('user'))
        : null;
      const currentUser = userSessionStr ? JSON.parse(userSessionStr) : { email: userEmail, roles: ['STUDENT'] };

      await fetch(`/api/courses/${course?.id || id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser }),
      });
      window.dispatchEvent(new Event('enrollment_updated'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnrollingDirect(false);
    }
  };

  // ยังโหลดข้อมูลอยู่ → แสดง loading แทน ไม่ให้ flash หน้า locked
  if (isLoading || isApproved === null) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          <p className="text-sm font-medium">กำลังโหลดข้อมูลรายวิชา...</p>
        </div>
      </div>
    );
  }

  // ห้องปิดและยังไม่ได้รับอนุมัติ
  if (isApproved === false) {
    const isPending = enrollmentStatus === 'PENDING';
    const isRejected = enrollmentStatus === 'REJECTED';

    // คลาสแบบปิด และสถานะรออนุมัติ → แสดงเฉพาะกรอบสี่เหลี่ยมบอกว่ารออนุมัติเท่านั้น
    if (isPending) {
      return (
        <div className="space-y-6 max-w-2xl mx-auto py-12 px-4 font-sans text-slate-900 animate-fadeIn">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="bg-white border-2 border-slate-300 rounded-xl p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">รออนุมัติ</h2>
          </div>
        </div>
      );
    }

    const coverImg = course?.image || course?.coverImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80';
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 font-sans text-slate-900 animate-fadeIn">
        <div className="relative rounded-3xl overflow-hidden min-h-[440px] w-full max-w-2xl flex items-center justify-center p-8 sm:p-12 text-center bg-slate-950 border border-slate-800 shadow-2xl group">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${coverImg}')` }}
          />
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />

          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border shadow-2xl backdrop-blur-md ${
              isRejected
                ? 'bg-rose-500/20 border-rose-500/40'
                : 'bg-amber-500/20 border-amber-500/40'
            }`}>
              <Lock className={`w-10 h-10 ${isRejected ? 'text-rose-400' : 'text-amber-400'}`} />
            </div>

            <div className="space-y-2">
              <span className={`px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider border ${
                isRejected
                  ? 'bg-rose-400/20 border-rose-400/40 text-rose-300'
                  : 'bg-amber-400/20 border-amber-400/40 text-amber-300'
              }`}>
                {isRejected ? 'คำขอเข้าเรียนถูกปฏิเสธ' : 'คลาสแบบปิด — รออนุมัติสิทธิ์'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-2">
                {isRejected ? 'ไม่ผ่านการอนุมัติ' : isPending ? 'รออนุมัติ' : 'วิชาคลาสแบบปิด'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                {isRejected
                  ? 'คำขอเข้าเรียนของคุณถูกอาจารย์ผู้สอนปฏิเสธ กรุณาติดต่ออาจารย์เพื่อขอข้อมูลเพิ่มเติม'
                  : isPending
                  ? (<>วิชานี้เป็นคลาสแบบปิด คำขอของคุณอยู่ระหว่างรอ <strong className="text-amber-300">อาจารย์ผู้สอน</strong> พิจารณาอนุมัติ<br />คุณจะเข้าดูบทเรียนได้ทันทีเมื่อได้รับการอนุมัติ</>)
                  : (<>วิชานี้เป็นคลาสแบบปิดเฉพาะ คุณสามารถกดยื่นคำขอเข้าเรียนเพื่อให้อาจารย์ผู้สอนพิจารณาอนุมัติได้ทันที</>)
                }
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!isPending && !isRejected && (
                <Button
                  variant="primary"
                  size="md"
                  disabled={isEnrollingDirect}
                  onClick={handleEnrollFromLearningPage}
                  className="w-full sm:w-auto rounded-full font-extrabold text-xs py-3.5 px-8 bg-[#CEF34B] hover:bg-[#bce038] text-black border-0 shadow-lg cursor-pointer"
                >
                  {isEnrollingDirect ? 'กำลังส่งคำขอ...' : 'ยื่นขออนุมัติเข้าเรียน'}
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push(`/courses/${course?.id || id}`)}
                className="w-full sm:w-auto rounded-full font-bold text-xs py-3.5 px-6 border-slate-700 text-white hover:bg-slate-800"
              >
                ดูรายละเอียดรายวิชา
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/courses')}
                className="w-full sm:w-auto rounded-full font-extrabold text-xs py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md"
              >
                กลับสู่คลังรายวิชา
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const materialsList = course?.materials || [];
  const documentMaterials = materialsList.filter((m: any) => m.type === 'PDF' || m.type === 'DOCUMENT');
  const videoMaterials = materialsList.filter((m: any) => m.type === 'VIDEO');

  const totalCount = materialsList.length;
  const completedCount = totalCount > 0 ? Object.values(completedMaterials).filter(Boolean).length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isCourseFinished = totalCount > 0 && progressPercent >= 100;

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Top Floating Navigation Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#CEF34B] font-mono font-bold text-xs">
                {course?.code || 'CS101'}
              </span>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                {course?.title || 'ห้องเรียน มหาวิทยาลัย Xการช่าง'}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-500 font-medium">อาจารย์ผู้สอน: {course?.createdBy?.name || 'ผศ.ดร.วิชาญ สอนดี'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Player/Document Viewer + Side Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Video/Document Viewer & Classroom Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Viewer Container */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-2">
            {!activeMaterial ? (
              <div className="p-16 text-center bg-slate-50 text-slate-700 rounded-2xl space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">ยังไม่มีสื่อการเรียนรู้ในรายวิชานี้</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">อาจารย์ผู้สอนกำลังจัดเตรียมบทเรียนและเอกสารประกอบการสอน</p>
              </div>
            ) : activeMaterial?.type === 'VIDEO' && hasVideos ? (
              /* Video Player View */
              <VideoPlayer
                src={
                  activeMaterial?.filePath &&
                  (activeMaterial.filePath.startsWith('http://') ||
                    activeMaterial.filePath.startsWith('https://'))
                    ? activeMaterial.filePath
                    : `/api/materials/${activeMaterial?.id}/stream`
                }
                title={activeMaterial?.title}
              />
            ) : (
              /* Dedicated Document & Blueprint Viewer (Minimalist Dark / Brand Aligned) */
              <div className="p-8 sm:p-12 text-center bg-slate-950 text-white rounded-2xl space-y-6 border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 space-y-4 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white shadow-sm">
                    <FileText className="w-8 h-8 text-white stroke-[1.5]" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-bold border border-white/10">
                      <span>เอกสารตำราเรียน (PDF)</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      {activeMaterial?.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
                      {activeMaterial?.description || 'ศึกษาเนื้อหาทฤษฎี มาตรฐานความปลอดภัย และแบบประกอบวิชาการช่าง'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono py-1">
                    <span>ขนาดไฟล์: {formatFileSize(activeMaterial?.fileSize)}</span>
                    <span>•</span>
                    <span>รูปแบบ: {activeMaterial?.type}</span>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<Download className="w-4 h-4 text-black" />}
                      onClick={() => alert(`เริ่มดาวน์โหลด: ${activeMaterial?.title}`)}
                      className="rounded-full font-extrabold text-xs py-3 px-8 bg-[#CEF34B] hover:bg-[#bce038] text-black border-0 shadow-sm cursor-pointer"
                    >
                      ดาวน์โหลดเอกสาร (PDF)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Viewer Footer Info (Without % progress) */}
            {activeMaterial && (
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">{activeMaterial?.title}</h2>
                  {activeMaterial?.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{activeMaterial.description}</p>
                  )}
                </div>

                <div>
                  {isCourseFinished && (
                    <span className="px-4 py-2 rounded-xl bg-slate-900 text-[#CEF34B] font-bold text-xs shadow-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#CEF34B]" />
                      <span>เรียนครบทุกบทเรียนแล้ว</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Completion Prompt Banner (Minimalist) */}
            {hasQuiz ? (
              <div className="m-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-[#CEF34B] flex items-center justify-center font-bold flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#CEF34B]" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">ศึกษาบทเรียนนี้เรียบร้อยแล้ว</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      สามารถกดทำแบบทดสอบหลังเรียนเพื่อประเมินความรู้และเก็บคะแนนประจำรายวิชานี้ได้ทันที
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setActiveTab('quiz')}
                  className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold text-xs rounded-full px-5 py-2.5 shadow-xs cursor-pointer"
                  rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
                >
                  ทำแบบทดสอบหลังเรียน
                </Button>
              </div>
            ) : (
              <div className="m-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <span>บทเรียนนี้ไม่มีแบบทดสอบหลังเรียน สามารถเลือกศึกษาบทเรียนถัดไปในสารบัญได้</span>
                </div>
              </div>
            )}
          </div>

          {/* Classroom Tabs Container */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Tab Header Buttons - Minimalist, No Q&A */}
            <div className="p-1 rounded-2xl bg-slate-100 flex gap-1 text-xs font-semibold text-slate-600 border border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-center whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                รายละเอียดบทเรียน
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'resources' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดเอกสาร ({documentMaterials.length})</span>
              </button>
              {hasQuiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'quiz' ? 'bg-slate-900 text-[#CEF34B] font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#CEF34B]" />
                  <span>แบบทดสอบหลังเรียน {isQuizSubmitted ? '✓' : ''}</span>
                </button>
              )}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                {course?.description?.trim() ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">คำอธิบายและรายละเอียดรายวิชา</h4>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{course.description}</p>
                  </div>
                ) : isSeedCourse ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">วัตถุประสงค์การเรียนรู้ (Learning Objectives)</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>เข้าใจหลักการพื้นฐานและมาตรฐานทางวิศวกรรมช่างกล</li>
                      <li>สามารถประยุกต์ใช้ความรู้ผ่านสื่อการสอนและเอกสารคู่มือประกอบบทเรียน</li>
                      {hasQuiz && <li>ทำแบบทดสอบหลังเรียนเพื่อวัดระดับความเข้าใจและบันทึกคะแนนสะสม</li>}
                    </ul>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-500">
                    <Info className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="font-bold text-slate-700">ไม่มีรายละเอียดเพิ่มเติมสำหรับบทเรียนนี้</p>
                    <p className="text-[11px] text-slate-400">อาจารย์ผู้สอนไม่ได้ระบุรายละเอียดเพิ่มเติม สามารถศึกษาเนื้อหาผ่านสื่อการเรียนได้ทันที</p>
                  </div>
                )}
                {isSeedCourse && (
                  <p>
                    บทเรียนนี้ออกแบบสำหรับนักศึกษา มหาวิทยาลัย Xการช่าง สามารถเรียนทบทวนได้ตลอดเวลาโดยไม่มีจำกัดจำนวนครั้ง
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Downloads (ดาวน์โหลดเอกสาร) */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                {hasDocuments && documentMaterials.length > 0 ? (
                  documentMaterials.map((doc: any, i: number) => (
                    <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#CEF34B] flex items-center justify-center font-bold flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#CEF34B]" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.title}</p>
                          <p className="text-[11px] text-slate-500">ขนาดไฟล์: {formatFileSize(doc.fileSize)} • คู่มือโดยอาจารย์ผู้สอน</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                        onClick={() => alert(`ดาวน์โหลด: ${doc.title}`)}
                        className="rounded-xl text-xs border-slate-200 text-slate-900 hover:bg-white font-bold cursor-pointer flex-shrink-0"
                      >
                        ดาวน์โหลด
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-500">
                    <Info className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-800 text-sm">วิชานี้อาจารย์ผู้สอนไม่ได้แนบเอกสารเพิ่มเติม</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      การเรียนการสอนดำเนินผ่านคลิปวิดีโอบรรยายในระบบโดยตรง คุณสามารถศึกษาเนื้อหาทั้งหมดผ่านวิดีโอในแต่ละบทเรียนได้ทันที
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Post-Lesson Quiz (แบบทดสอบหลังเรียนในระบบ + Google Forms Option) */}
            {activeTab === 'quiz' && hasQuiz && (
              <div className="space-y-6">
                {/* Result Card if already submitted */}
                {isQuizSubmitted && currentQuizQuestions.length > 0 && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-emerald-950">
                          🎉 ทำแบบทดสอบหลังเรียนสำเร็จเรียบร้อย!
                        </h4>
                        <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                          คะแนนที่คุณทำได้: <strong className="text-emerald-950 text-sm">{quizScore} / {currentQuizQuestions.length} คะแนน</strong> ({Math.round((quizScore / currentQuizQuestions.length) * 100)}%) • ผ่านเกณฑ์มาตรฐานสถาบัน
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsQuizSubmitted(false);
                        setUserAnswers({});
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                    >
                      🔄 ทำแบบทดสอบใหม่อีกครั้ง
                    </button>
                  </div>
                )}

                {/* Interactive Questions List (Only if questions exist) */}
                {currentQuizQuestions.length > 0 && (
                  <div className="space-y-4">
                    {currentQuizQuestions.map((q, qIdx) => {
                      const selectedOpt = userAnswers[qIdx];
                      const isAnswered = selectedOpt !== undefined;
                      const isCorrect = isQuizSubmitted && selectedOpt === q.correctAnswer;
                      const isWrong = isQuizSubmitted && selectedOpt !== q.correctAnswer;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border transition-all space-y-3 text-xs ${
                            isQuizSubmitted
                              ? isCorrect
                                ? 'bg-emerald-50/50 border-emerald-300'
                                : 'bg-rose-50/40 border-rose-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-[#CEF34B] font-bold font-mono text-[10px] flex-shrink-0">
                                ข้อ {qIdx + 1}/{currentQuizQuestions.length}
                              </span>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                                {q.question}
                              </h4>
                            </div>

                            {isQuizSubmitted && (
                              <span className={`text-xs font-bold flex items-center gap-1 flex-shrink-0 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {isCorrect ? (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>ถูกต้อง (+1)</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    <span>ไม่ถูกต้อง (0)</span>
                                  </>
                                )}
                              </span>
                            )}
                          </div>

                          {/* 4 Multiple Choice Options */}
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isChosen = selectedOpt === optIdx;
                              const isRightAnswer = isQuizSubmitted && optIdx === q.correctAnswer;
                              const isChosenWrong = isQuizSubmitted && isChosen && !isRightAnswer;

                              return (
                                <div
                                  key={optIdx}
                                  onClick={() => handleOptionSelect(qIdx, optIdx)}
                                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer select-none ${
                                    isRightAnswer
                                      ? 'bg-emerald-100/80 border-emerald-400 font-bold text-emerald-950 shadow-xs'
                                      : isChosenWrong
                                      ? 'bg-rose-100/80 border-rose-400 font-bold text-rose-950'
                                      : isChosen
                                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                                      isRightAnswer
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : isChosenWrong
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : isChosen
                                        ? 'bg-[#CEF34B] text-black border-[#CEF34B]'
                                        : 'border-slate-300 text-slate-500'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <span className="flex-1 leading-relaxed">{opt}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation after submission */}
                          {isQuizSubmitted && (
                            <div className="p-3 rounded-xl bg-white/90 border border-slate-200 text-[11px] text-slate-600 space-y-1 mt-2">
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>คำอธิบายเฉลย:</span>
                              </p>
                              <p className="text-slate-600 leading-relaxed pl-5">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quiz Submit Button */}
                {!isQuizSubmitted && currentQuizQuestions.length > 0 ? (
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-slate-500">
                      ตอบแล้ว {Object.keys(userAnswers).length} จาก {currentQuizQuestions.length} ข้อ
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={Object.keys(userAnswers).length < currentQuizQuestions.length}
                      onClick={handleSubmitQuiz}
                      className="bg-slate-900 hover:bg-slate-800 text-[#CEF34B] font-bold text-xs rounded-full px-8 py-3 shadow-md cursor-pointer disabled:opacity-40"
                    >
                      ส่งคำตอบและตรวจผลคะแนน
                    </Button>
                  </div>
                ) : null}

                {/* Google Forms Option (if quizUrl provided or no interactive questions) */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-700">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs flex items-center gap-2 text-slate-900">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>แบบทดสอบหลังเรียนผ่าน Google Forms (Google Forms Quiz)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {course?.quizUrl
                        ? 'เข้าทำแบบทดสอบที่อาจารย์ผู้สอนกำหนดไว้สำหรับรายวิชานี้ผ่าน Google Forms'
                        : 'สำหรับผู้เรียนที่ต้องการส่งผลการประเมินเข้าสู่ระบบประมวลผลกลางของสถาบันผ่าน Google Forms'}
                    </p>
                  </div>
                  <a
                    href={course?.quizUrl || 'https://forms.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-[#CEF34B] font-bold text-xs shadow-xs transition-all self-start sm:self-auto flex-shrink-0 cursor-pointer"
                  >
                    <span>เปิดแบบทดสอบ Google Forms</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#CEF34B]" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Playlist & Syllabus Side Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-900 text-white space-y-1.5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#CEF34B]" />
                  <span>สารบัญเนื้อหาบทเรียน ({materialsList.length} รายการ)</span>
                </h3>
                <span className="text-[10px] bg-white/10 text-white px-2.5 py-0.5 rounded-full font-bold border border-white/10">
                  {hasVideos ? 'วิดีโอ & เอกสาร' : 'เอกสารตำราเรียน'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">คลิกเลือกบทเรียนที่ต้องการเข้าศึกษาได้ทันที</p>
            </div>

            <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
              {materialsList.map((m: any, idx: number) => {
                const isActive = activeMaterial?.id === m.id;
                const isDone = completedMaterials[m.id];
                return (
                  <button
                    key={m.id}
                    disabled={!isApproved}
                    onClick={() => isApproved && setActiveMaterial(m)}
                    className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      !isApproved
                        ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed border border-slate-200'
                        : isActive
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {!isApproved ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#CEF34B]" />
                      ) : m.type === 'VIDEO' ? (
                        <PlayCircle className={`w-4 h-4 ${isActive ? 'text-[#CEF34B]' : 'text-slate-400'}`} />
                      ) : (
                        <FileText className={`w-4 h-4 ${isActive ? 'text-[#CEF34B]' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 leading-snug">{idx + 1}. {m.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] opacity-80 font-normal">
                        <span>
                          {!isApproved
                            ? 'รออนุมัติ'
                            : m.type === 'VIDEO'
                            ? 'วิดีโอบรรยาย'
                            : 'เอกสาร PDF'}
                        </span>
                        {isApproved && m.duration && (
                          <span>• {Math.round(m.duration / 60)} นาที</span>
                        )}
                        {isApproved && m.fileSize && m.type !== 'VIDEO' && (
                          <span>• {formatFileSize(m.fileSize)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
