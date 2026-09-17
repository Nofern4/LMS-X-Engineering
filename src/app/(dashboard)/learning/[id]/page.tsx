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
  ArrowRight
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

export default function MaterialLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'resources' | 'quiz'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState<Record<string, boolean>>({
    'mat-1': true,
  });

  const checkIsClosed = (courseObj?: any) => {
    // Explicitly open courses: CS101 and AUTO101
    if (
      id === 'course-1' ||
      id === 'course-4' ||
      id === 'CS101' ||
      id === 'AUTO101' ||
      courseObj?.code === 'CS101' ||
      courseObj?.code === 'AUTO101' ||
      courseObj?.accessType === 'OPEN' ||
      courseObj?.accessType === 'PUBLIC'
    ) {
      return false;
    }
    // Any other course is CLOSED by default (EE305, ME201, course-2, course-3, or DB CUIDs)
    return true;
  };

  const checkApproved = (courseObj?: any) => {
    const isClosed = checkIsClosed(courseObj);
    if (!isClosed) return true;

    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem(`course_approved_${id}`);
      const savedCode = courseObj?.code ? localStorage.getItem(`course_approved_${courseObj.code}`) : null;
      if (savedId === 'true' || savedCode === 'true') return true;
    }
    return false;
  };

  const [isApproved, setIsApproved] = useState<boolean>(() => checkApproved());

  useEffect(() => {
    setIsApproved(checkApproved(course));
  }, [course, id]);

  // State when video finishes playing
  const [isVideoFinished, setIsVideoFinished] = useState(true);

  // Q&A state
  const [qaInput, setQaInput] = useState('');
  const [questions, setQuestions] = useState<QAItem[]>([
    {
      id: 'q1',
      user: 'สมชาย เรียนดี',
      question: 'สามารถใช้ Node.js v22 แทน LTS ได้ไหมครับ มีผลต่อไลบรารีในคอร์สไหม?',
      replies: 1,
      timeAgo: '2 ชั่วโมงที่แล้ว',
    },
    {
      id: 'q2',
      user: 'อนันต์ สายโค้ด',
      question: 'ไฟล์สไลด์ PDF บทที่ 1 มีโค้ดตัวอย่างในหน้า 15 ไหมครับ?',
      replies: 0,
      timeAgo: '1 วันที่แล้ว',
    },
  ]);

  // Quiz state (แบบทดสอบหลังเรียน - ทำได้ครั้งเดียว)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'เครื่องมือใดในการพัฒนาโปรแกรมที่จำเป็นต้องเปิดใช้ระบบ WSL2 สำหรับระบบปฏิบัติการ Windows?',
      options: [
        'Docker Desktop & Linux Subsystem',
        'Microsoft Word Engine',
        'Adobe Photoshop Core',
        'Google Chrome Extension'
      ],
      correctAnswer: 0,
      explanation: 'Docker Desktop บน Windows ต้องพึ่งพา Linux Kernel ผ่าน WSL2 เพื่อรัน Linux Containers ได้อย่างมีประสิทธิภาพสูงสุด'
    },
    {
      id: 'q2',
      question: 'การแยกโครงสร้างไฟล์แบบ Controller, Service, Repository มีประโยชน์หลักอย่างไร?',
      options: [
        'ทำให้ไฟล์มีขนาดใหญ่ขึ้น',
        'แยกความรับผิดชอบของโค้ดให้เป็นสัดส่วน ดูแลรักษาง่าย (Clean Architecture)',
        'ทำให้ระบบประมวลผลช้าลง',
        'ใช้สำหรับแต่งสีหน้าจอเท่านั้น'
      ],
      correctAnswer: 1,
      explanation: 'การแยก Controller (รับ HTTP), Service (ประมวลผลธุรกิจ), Repository (ติดต่อฐานข้อมูล) ช่วยให้โค้ดเป็นระเบียบ ทบทวนและทดสอบง่าย'
    },
    {
      id: 'q3',
      question: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมด้วย PLC ทำหน้าที่หลักอะไรในโรงงานอัตโนมัติ?',
      options: [
        'ควบคุมลำดับการทำงานของเครื่องจักรและรับค่าจากเซนเซอร์',
        'เปิดเพลงคลายเครียดในโรงงาน',
        'จัดทำเอกสารบัญชีรายเดือน',
        'คำนวณภาษีสถาบันประจำปี'
      ],
      correctAnswer: 0,
      explanation: 'PLC (Programmable Logic Controller) ถูกออกแบบเพื่อประมวลผลคำสั่งตามลำดับในการควบคุมเครื่องกลและอุปกรณ์อุตสาหกรรม'
    }
  ];

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data.course);
        if (data.course?.materials?.length > 0) {
          setActiveMaterial(data.course.materials[0]);
        } else {
          setActiveMaterial({
            id: 'mat-1',
            title: 'บทที่ 1: แนะนำวิชา และการติดตั้งเครื่องมือพัฒนา',
            description: 'วิดีโอการบรรยายปฐมนิเทศวิชา พร้อมการเตรียมสภาพแวดล้อมระบบและการตั้งค่าซอฟต์แวร์',
            type: 'VIDEO',
            filePath: 'materials/sample_intro_video.mp4',
            duration: 2700,
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeMaterial) {
      try {
        const courseImages: Record<string, string> = {
          'course-1': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80',
          'course-2': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
          'course-3': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
          'course-4': 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1600&q=80',
        };
        const coverImage = course?.image || course?.coverImage || courseImages[id] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80';
        const title = course?.title || (id === 'course-3' ? 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT (EE305)' : id === 'course-4' ? 'เทคโนโลยีช่างยนต์และยานยนต์ไฟฟ้า EV (AUTO101)' : id === 'course-2' ? 'กลศาสตร์เครื่องกลและการออกแบบอัตโนมัติ (ME201)' : 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน (CS101)');

        localStorage.setItem('last_watched_video', JSON.stringify({
          courseId: id,
          title: title,
          lesson: activeMaterial.title,
          link: `/learning/${id}`,
          image: coverImage,
          isUnfinished: true,
          updatedAt: Date.now()
        }));
      } catch (e) {}
    }
  }, [course, activeMaterial, id]);

  const handleAddQuestion = () => {
    if (!qaInput.trim()) return;
    const newQ: QAItem = {
      id: Date.now().toString(),
      user: 'สมชาย ช่างกล (คุณ)',
      question: qaInput,
      replies: 0,
      timeAgo: 'เมื่อสักครู่',
    };
    setQuestions([newQ, ...questions]);
    setQaInput('');
  };

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return; // ทำได้ครั้งเดียว
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (isQuizSubmitted) return;
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });
    setQuizScore(correctCount);
    setIsQuizSubmitted(true);
  };

  // If closed course & not approved: RETURN ONLY THE LOCKED SCREEN (NO CLASSROOM/VIDEO)
  if (!isApproved) {
    const coverImg = course?.image || course?.coverImage || (id === 'course-3' ? 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80' : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80');
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 font-sans text-slate-900 animate-fadeIn">
        <div className="relative rounded-3xl overflow-hidden min-h-[440px] w-full max-w-2xl flex items-center justify-center p-8 sm:p-12 text-center bg-slate-950 border border-slate-800 shadow-2xl group">
          {/* Background Image with Dark Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${coverImg}')` }}
          />
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />

          {/* Locked Pending Content */}
          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-2xl backdrop-blur-md">
              <Lock className="w-10 h-10 text-amber-400" />
            </div>

            <div className="space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                คลาสแบบปิด (ต้องได้รับการอนุมัติสิทธิ์)
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-2">
                รออนุมัติ
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                วิชานี้เป็นคลาสแบบปิด อยู่ระหว่างรอ <strong className="text-amber-300">"คนอนุมัติ" (Course Approver)</strong> กดอนุมัติสิทธิ์ <br />
                คุณไม่สามารถเข้าดูคลิปบทเรียนหรือสื่อการเรียนรู้ใดๆ ได้จนกว่าจะได้รับการกดอนุมัติ
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/courses')}
                className="w-full sm:w-auto rounded-full font-extrabold text-xs py-3.5 px-8 bg-[#CEF34B] hover:bg-[#bce038] text-black border-0 shadow-lg"
              >
                กลับสู่คลังรายวิชา
              </Button>
              <button
                onClick={() => {
                  localStorage.setItem(`course_approved_${id}`, 'true');
                  if (course?.code) {
                    localStorage.setItem(`course_approved_${course.code}`, 'true');
                  }
                  setIsApproved(true);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all border border-white/20"
              >
                [จำลองสิทธิ์: กดอนุมัติแล้ว]
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const materialsList = course?.materials?.length > 0
    ? course.materials
    : [
        {
          id: 'mat-1',
          title: 'บทที่ 1: แนะนำวิชา และการติดตั้งเครื่องมือพัฒนา',
          description: 'วิดีโอการบรรยายปฐมนิเทศวิชา พร้อมการเตรียมสภาพแวดล้อมระบบ',
          type: 'VIDEO',
          duration: 2700,
        },
        {
          id: 'mat-2',
          title: 'เอกสารประกอบการเรียน บทที่ 1-3 (PDF)',
          description: 'สไลด์การสอนแบบรายละเอียดพร้อมแบบฝึกหัดทบทวน',
          type: 'PDF',
        },
      ];

  const totalCount = materialsList.length;
  const completedCount = Object.values(completedMaterials).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isCourseFinished = progressPercent >= 100;

  // Documents availability check per course/professor (ขึ้นอยู่กับอาจารย์แต่ละท่าน)
  const hasDocuments = course?.hasDocuments !== false && id !== 'course-3';

  // Quiz availability check per course/professor (ขึ้นอยู่กับอาจารย์ผู้สอน แต่ละวิชาไม่จำเป็นต้องมีทุกวิชา)
  const hasQuiz = course?.hasQuiz !== false && id !== 'course-2' && id !== 'course-4';

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Top Floating Navigation Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 font-mono font-bold text-xs">
                {course?.code || 'CS101'}
              </span>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                {course?.title || 'ห้องเรียน มหาวิทยาลัย Xการช่าง'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">เรียนออนไลน์ได้ตลอดเวลา 24 ชั่วโมง • มหาวิทยาลัย Xการช่าง LMS</p>
          </div>
        </div>
      </div>

      {/* Pending Approval Notice Banner for Closed Classes */}
      {!isApproved && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <Lock className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                🔒 คุณส่งคำขอลงชื่อเข้าเรียนวิชาคลาสแบบปิดเรียบร้อยแล้ว
              </h4>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                ระบบได้เด้งมาที่หน้าวิชาที่เลือกเรียน อยู่ระหว่างรอ "คนอนุมัติ" (Course Approver) ตรวจสอบและกดอนุมัติสิทธิ์การเข้าเรียน
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="px-4 py-1.5 rounded-full bg-amber-200 text-amber-950 font-extrabold text-xs">
              สถานะ: รอคนอนุมัติ
            </span>
            <button
              onClick={() => {
                localStorage.setItem(`course_approved_${id}`, 'true');
                setIsApproved(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-black text-[#CEF34B] hover:bg-slate-800 font-extrabold text-xs transition-all shadow-xs"
              title="คลิกเพื่อทดสอบจำลองว่าคนอนุมัติกดอนุมัติสิทธิ์แล้ว"
            >
              [จำลองสิทธิ์: กดอนุมัติแล้ว]
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Video Player + Side Syllabus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Video & Classroom Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Player Container */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-2">
            {!isApproved ? (
              <div className="relative rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[440px] flex items-center justify-center p-8 sm:p-14 text-center group bg-slate-950">
                {/* Background Cover Image with Dark Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${course?.image || course?.coverImage || (id === 'course-3' ? 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80' : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80')}')`,
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />

                {/* Content Overlay */}
                <div className="relative z-10 space-y-5 max-w-xl mx-auto">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-xl backdrop-blur-md">
                    <Lock className="w-10 h-10 text-amber-400" />
                  </div>

                  <div className="space-y-2">
                    <span className="px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                      คลาสแบบปิด (รอการอนุมัติสิทธิ์)
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                      รออนุมัติ
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold max-w-md mx-auto">
                      คำขอเข้าเรียนวิชานี้อยู่ระหว่างรอ <strong className="text-amber-300">"คนอนุมัติ" (Course Approver)</strong> กดอนุมัติสิทธิ์ <br />
                      คุณจะสามารถเข้าดูคลิปบทเรียนและสื่อการสอนได้ ก็ต่อเมื่อคนอนุมัติ อนุมัติสิทธิ์ให้แล้วเท่านั้น
                    </p>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        localStorage.setItem(`course_approved_${id}`, 'true');
                        setIsApproved(true);
                      }}
                      className="px-6 py-3 rounded-full bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold text-xs transition-all shadow-lg transform hover:-translate-y-0.5"
                    >
                      [จำลองสิทธิ์: คนอนุมัติกดอนุมัติแล้ว]
                    </button>
                    <button
                      onClick={() => router.push('/student')}
                      className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all border border-white/20"
                    >
                      กลับสู่หน้ารายวิชาที่เข้าเรียน
                    </button>
                  </div>
                </div>
              </div>
            ) : activeMaterial?.type === 'VIDEO' ? (
              <VideoPlayer
                src={`/api/materials/${activeMaterial.id}/stream`}
                title={activeMaterial.title}
                poster="/assets/poster_placeholder.png"
              />
            ) : (
              <div className="p-12 text-center bg-slate-900 text-white rounded-2xl space-y-4">
                <FileText className="w-16 h-16 text-amber-400 mx-auto stroke-[1.5]" />
                <h3 className="text-xl font-bold text-white">{activeMaterial?.title}</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">{activeMaterial?.description}</p>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Download className="w-4 h-4 text-slate-950" />}
                  onClick={() => alert('เริ่มดาวน์โหลดไฟล์เอกสาร PDF')}
                  className="rounded-xl font-bold text-xs py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 border-0"
                >
                  ดาวน์โหลดเอกสารการเรียน (PDF)
                </Button>
              </div>
            )}

            {/* Video Footer Info & Percentage Progress Indicator */}
            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{activeMaterial?.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{activeMaterial?.description}</p>
              </div>

              {/* Progress Percentage Badge (Only show if started/watched) */}
              <div>
                {isCourseFinished ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>✅ เรียนจบแล้ว</span>
                  </span>
                ) : progressPercent > 0 ? (
                  <span className="px-4 py-2 rounded-xl bg-slate-900 text-[#CEF34B] font-bold text-xs shadow-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#CEF34B]" />
                    <span>ความคืบหน้าการเรียน: {progressPercent}%</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Post-Video Completion Prompt (แสดงขึ้นมาทันทีเมื่อดูคลิปจบเท่านั้น) */}
            {isVideoFinished && hasQuiz && (
              <div className="m-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">🎬 คุณดูคลิปวิดีโอบทเรียนนี้จบแล้ว!</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      สามารถกดทำแบบทดสอบหลังเรียนเพื่อทดสอบความเข้าใจของบทนี้ได้ทันที
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setActiveTab('quiz')}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl px-5 py-2.5 shadow-xs"
                  rightIcon={<ArrowRight className="w-4 h-4 text-amber-400" />}
                >
                  ทำแบบทดสอบหลังเรียนต่อไป
                </Button>
              </div>
            )}
          </div>

          {/* Classroom Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Tab Header Buttons */}
            <div className="p-1 rounded-2xl bg-slate-100 flex gap-1 text-xs font-semibold text-slate-600 border border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all text-center whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                รายละเอียดบทเรียน
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'qa' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>ถาม-ตอบ ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'resources' ? 'bg-slate-900 text-white font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดเอกสาร</span>
              </button>
              {hasQuiz && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'quiz' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>แบบทดสอบหลังเรียน</span>
                </button>
              )}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs">วัตถุประสงค์การเรียนรู้ (Learning Objectives)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>เข้าใจโครงสร้างการทำงานและเตรียมเครื่องมือพัฒนาโปรแกรม</li>
                    <li>สามารถติดตั้งและกำหนดค่าสภาพแวดล้อมให้พร้อมสำหรับการเขียนโค้ด</li>
                    <li>ประยุกต์ใช้แบบฝึกหัดทบทวนหลังบทเรียนเพื่อประเมินความเข้าใจ</li>
                  </ul>
                </div>
                <p>
                  บทเรียนนี้ออกแบบสำหรับนักศึกษา มหาวิทยาลัย Xการช่าง สามารถเรียนทบทวนได้ตลอดเวลาโดยไม่มีจำกัดจำนวนครั้ง
                </p>
              </div>
            )}

            {/* Tab 2: Q&A */}
            {activeTab === 'qa' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="ถามคำถามถึงอาจารย์ผู้สอนเกี่ยวกับบทเรียนนี้..."
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2.5 px-4 text-xs text-slate-900 focus:bg-white focus:border-slate-900"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddQuestion}
                    className="rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-amber-400"
                  >
                    โพสต์คำถาม
                  </Button>
                </div>

                <div className="space-y-2.5 pt-2">
                  {questions.map((q) => (
                    <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-900">{q.user}</span>
                        <span className="text-[10px]">{q.timeAgo}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Downloads (ดาวน์โหลดเอกสาร) */}
            {activeTab === 'resources' && (
              <div className="space-y-3">
                {hasDocuments ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">เอกสารสไลด์คำบรรยาย บทที่ 1-3 (PDF)</p>
                        <p className="text-[11px] text-slate-500">ขนาดไฟล์: 15.4 MB • พิมพ์คู่มือโดยอาจารย์ผู้สอน</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} className="rounded-xl text-xs border-slate-200 text-slate-900 hover:bg-white font-bold">
                      ดาวน์โหลดเอกสาร
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs text-slate-500">
                    <Info className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="font-bold text-slate-700">วิชานี้อาจารย์ผู้สอนไม่ได้แนบเอกสารเพิ่มเติม</p>
                    <p className="text-[11px]">สามารถเรียนผ่านวิดีโอบรรยายในระบบได้ทันที</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Post-Lesson Quiz (แบบทดสอบหลังเรียนผ่าน Google Forms) */}
            {activeTab === 'quiz' && (
              <div className="space-y-6">
                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-950 shadow-xs">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
                      <HelpCircle className="w-5 h-5 text-amber-600" />
                      <span>แบบทดสอบหลังเรียนผ่าน Google Forms (Google Forms Quiz)</span>
                    </h4>
                    <p className="text-xs text-amber-900 font-medium">
                      การทำแบบทดสอบหลังเรียนจะทำผ่าน <strong>Google Forms</strong> เท่านั้น เพื่อตรวจและบันทึกคะแนนเข้าสู่ระบบสถาบัน
                    </p>
                  </div>
                  <a
                    href="https://forms.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-[#CEF34B] font-extrabold text-xs shadow-md transition-all self-start sm:self-auto flex-shrink-0"
                  >
                    <span>เปิดทำแบบทดสอบใน Google Forms</span>
                    <ArrowRight className="w-4 h-4 text-[#CEF34B]" />
                  </a>
                </div>

                {/* Google Forms Container Frame */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300 shadow-xs">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base font-extrabold text-slate-900">เริ่มทำแบบทดสอบหลังเรียน</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      คลิกปุ่มด้านล่างเพื่อเปิดทำแบบทดสอบ Google Forms ประจำบทเรียนนี้ ระบบจะบันทึกเวลาและการส่งคำตอบให้อัตโนมัติ
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href="https://forms.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold text-xs shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <span>คลิกตรงนี้เพื่อทำแบบทดสอบ Google Forms</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </a>
                  </div>
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
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>เนื้อหาบทเรียน ({materialsList.length} บท)</span>
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                  บทเรียนออนไลน์
                </span>
              </div>
              <p className="text-[11px] text-slate-300">คลิกเลือกบทเรียนที่ต้องการเข้าศึกษาได้ทันที</p>
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
                    className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 ${
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
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : m.type === 'VIDEO' ? (
                        <PlayCircle className={`w-4 h-4 ${isActive ? 'text-[#CEF34B]' : 'text-slate-400'}`} />
                      ) : (
                        <FileText className={`w-4 h-4 ${isActive ? 'text-[#CEF34B]' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 leading-snug">{idx + 1}. {m.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] opacity-80 font-normal">
                        <span>{!isApproved ? '🔒 รออนุมัติ' : m.type === 'VIDEO' ? 'วิดีโอบรรยาย' : 'เอกสาร PDF'}</span>
                        {isApproved && m.duration && <span>• 45 นาที</span>}
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
