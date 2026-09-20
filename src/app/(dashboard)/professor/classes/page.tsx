'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Video, Play, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { Modal } from '@/components/ui/Modal';

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
  courseId?: string;
}

const DEFAULT_VIDEO_CLIPS: ProfessorVideoClip[] = [
  { id: 'vid-cs-1', courseCode: 'CS101', courseTitle: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน', category: 'วิศวกรรมคอมพิวเตอร์', title: 'บทที่ 1: พื้นฐานการเขียนโปรแกรมและโครงสร้างข้อมูลเบื้องต้น', description: 'แนะนำภาษาโปรแกรมมิ่ง วิธีการติดตั้งเครื่องมือ Compiler, IDE และโครงสร้างโปรแกรมพื้นฐาน', durationText: '60:00 นาที', fileSizeText: '480 MB', uploadDate: '1 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', courseId: '20b13738-1e27-464e-9f5c-b92899ae25ef' },
  { id: 'vid-cs-2', courseCode: 'CS101', courseTitle: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน', category: 'วิศวกรรมคอมพิวเตอร์', title: 'บทที่ 2: ตัวแปร ชนิดข้อมูล เงื่อนไข และลูปการทำงาน', description: 'การประกาศตัวแปร ชนิดข้อมูลต่างๆ การใช้คำสั่ง if-else และการวนซ้ำด้วย for/while loop', durationText: '70:00 นาที', fileSizeText: '520 MB', uploadDate: '3 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', courseId: '20b13738-1e27-464e-9f5c-b92899ae25ef' },
  { id: 'vid-cs-3', courseCode: 'CS101', courseTitle: 'การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน', category: 'วิศวกรรมคอมพิวเตอร์', title: 'บทที่ 3: ฟังก์ชัน พอยน์เตอร์ และอาร์เรย์ขั้นสูง', description: 'การสร้าง Modular Functions, การจัดการหน่วยความจำผ่าน Pointer และการประมวลผล Array', durationText: '85:00 นาที', fileSizeText: '610 MB', uploadDate: '7 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', courseId: '20b13738-1e27-464e-9f5c-b92899ae25ef' },
  { id: 'vid-ee-1', courseCode: 'EE305', courseTitle: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT', category: 'ช่างไฟฟ้ากำลัง', title: 'บทที่ 1: วงจรควบคุมมอเตอร์ไฟฟ้าและ Magnetic Contactor', description: 'การต่อวงจรควบคุมมอเตอร์ 3 เฟส ด้วย Magnetic Contactor, Overload Relay และ Safety Interlock', durationText: '75:00 นาที', fileSizeText: '550 MB', uploadDate: '4 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', courseId: '05ae7347-940e-463d-a2d9-40905e64c211' },
  { id: 'vid-ee-2', courseCode: 'EE305', courseTitle: 'ระบบควบคุมไฟฟ้าอุตสาหกรรมและ IoT', category: 'ช่างไฟฟ้ากำลัง', title: 'บทที่ 2: การเขียนโปรแกรม PLC ด้วย Ladder Diagram และการเชื่อมต่อ IoT', description: 'หลักการทำงานของ PLC อุตสาหกรรม, การออกแบบ Ladder Diagram ควบคุม I/O และเชื่อมต่อ IoT Broker', durationText: '90:00 นาที', fileSizeText: '620 MB', uploadDate: '9 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', courseId: '05ae7347-940e-463d-a2d9-40905e64c211' },
  { id: 'vid-se-1', courseCode: 'SE302', courseTitle: 'สถาปัตยกรรมซอฟต์แวร์และการออกแบบระบบ', category: 'วิศวกรรมซอฟต์แวร์', title: 'บทที่ 1: สถาปัตยกรรม Clean Architecture และ Microservices', description: 'การแบ่ง Layer ระบบแบบ Clean Architecture, Domain-Driven Design และการสื่อสารระหว่าง Microservices', durationText: '75:00 นาที', fileSizeText: '580 MB', uploadDate: '5 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', courseId: '1dc8edb3-d31e-4c96-ae04-72a61bcd1c10' },
  { id: 'vid-se-2', courseCode: 'SE302', courseTitle: 'สถาปัตยกรรมซอฟต์แวร์และการออกแบบระบบ', category: 'วิศวกรรมซอฟต์แวร์', title: 'บทที่ 2: Design Patterns สำหรับระบบขนาดใหญ่และ Automated Testing', description: 'Factory, Repository, Observer Pattern และการเซ็ตอัป Unit/Integration Tests ร่วมกับ CI/CD Pipeline', durationText: '60:00 นาที', fileSizeText: '490 MB', uploadDate: '10 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', courseId: '1dc8edb3-d31e-4c96-ae04-72a61bcd1c10' },
  { id: 'vid-me-1', courseCode: 'ME201', courseTitle: 'วิศวกรรมเครื่องกลและกรรมวิธีการผลิตชิ้นส่วน', category: 'ช่างกลโรงงาน', title: 'บทที่ 1: พื้นฐานงานกลึง งานกัดโลหะ และความปลอดภัยในโรงงานช่างกล', description: 'หลักการทำงานของเครื่องกลึง เครื่องกัด และการเลือกใช้เครื่องมือตัดสำหรับโลหะแต่ละชนิดตามมาตรฐานสากล', durationText: '55:00 นาที', fileSizeText: '470 MB', uploadDate: '2 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', courseId: 'edc15886-2dda-4b2f-a46b-5a00ebd05ab7' },
  { id: 'vid-me-2', courseCode: 'ME201', courseTitle: 'วิศวกรรมเครื่องกลและกรรมวิธีการผลิตชิ้นส่วน', category: 'ช่างกลโรงงาน', title: 'บทที่ 2: การเขียนโปรแกรมเครื่องจักร CNC และการวัดละเอียดทางวิศวกรรม', description: 'การเขียนโค้ด G-Code / M-Code สำหรับเครื่องกลึง CNC และการใช้อุปกรณ์วัดละเอียดเกจบล็อก เวอร์เนียร์ ไมโครมิเตอร์', durationText: '65:00 นาที', fileSizeText: '540 MB', uploadDate: '6 ก.ย. 2026', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4', courseId: 'edc15886-2dda-4b2f-a46b-5a00ebd05ab7' },
];

export default function ProfessorClassesPage() {
  const [activeVideoModal, setActiveVideoModal] = useState<ProfessorVideoClip | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [allClips, setAllClips] = useState<ProfessorVideoClip[]>(DEFAULT_VIDEO_CLIPS);
  const [courseFilters, setCourseFilters] = useState([
    { code: 'ALL', label: 'ทั้งหมด' },
    { code: 'CS101', label: 'CS101 (วิศวกรรมคอมพิวเตอร์)' },
    { code: 'SE302', label: 'SE302 (วิศวกรรมซอฟต์แวร์)' },
    { code: 'ME201', label: 'ME201 (ช่างกลโรงงาน)' },
    { code: 'EE305', label: 'EE305 (ช่างไฟฟ้ากำลัง)' },
  ]);

  const fetchClasses = () => {
    fetch('/api/courses?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        const list: any[] = data.courses || [];
        const approvedCourses = list.filter((c: any) => c.status === 'PUBLISHED' || c.status === 'APPROVED');

        const filtersMap = new Map<string, string>();
        filtersMap.set('ALL', 'ทั้งหมด');
        filtersMap.set('CS101', 'CS101 (วิศวกรรมคอมพิวเตอร์)');
        filtersMap.set('SE302', 'SE302 (วิศวกรรมซอฟต์แวร์)');
        filtersMap.set('ME201', 'ME201 (ช่างกลโรงงาน)');
        filtersMap.set('EE305', 'EE305 (ช่างไฟฟ้ากำลัง)');

        const dynamicClips: ProfessorVideoClip[] = [];

        approvedCourses.forEach((c: any) => {
          if (!filtersMap.has(c.code)) {
            filtersMap.set(c.code, `${c.code} (${c.category || c.title})`);
          }

          const materials = c.materials || [];
          const videoMats = materials.filter((m: any) => m.type === 'VIDEO');

          if (videoMats.length > 0) {
            videoMats.forEach((m: any, idx: number) => {
              dynamicClips.push({
                id: m.id || `mat-${c.code}-${idx}`,
                courseCode: c.code,
                courseTitle: c.title,
                category: c.category || 'ทั่วไป',
                title: m.title || `บทเรียน: ${c.title}`,
                description: m.description || c.description || 'บทเรียนที่ได้รับการอนุมัติและเปิดสอนในระบบ',
                durationText: m.duration ? `${Math.round(m.duration / 60)}:00 นาที` : '60:00 นาที',
                fileSizeText: m.fileSize ? `${Math.round(Number(m.fileSize) / (1024 * 1024))} MB` : '150 MB',
                uploadDate: new Date(m.createdAt || c.createdAt || Date.now()).toLocaleDateString('th-TH'),
                videoUrl: m.filePath?.startsWith('http') ? m.filePath : `/api/materials/${m.id}/stream`,
                courseId: c.id,
              });
            });
          } else {
            dynamicClips.push({
              id: `course-${c.id}`,
              courseCode: c.code,
              courseTitle: c.title,
              category: c.category || 'ทั่วไป',
              title: `บทนำรายวิชา: ${c.title}`,
              description: c.description || 'รายวิชาที่ได้รับการอนุมัติและเปิดสอนในระบบ',
              durationText: '60:00 นาที',
              fileSizeText: '180 MB',
              uploadDate: new Date(c.createdAt || Date.now()).toLocaleDateString('th-TH'),
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              courseId: c.id,
            });
          }
        });

        const customClips = dynamicClips.filter((dc) => !['CS101', 'SE302', 'ME201', 'EE305'].includes(dc.courseCode));
        setAllClips([...customClips, ...DEFAULT_VIDEO_CLIPS]);

        const nextFilters = Array.from(filtersMap.entries()).map(([code, label]) => ({ code, label }));
        setCourseFilters(nextFilters);
      })
      .catch((err) => console.error('Failed to fetch classes:', err));
  };

  useEffect(() => {
    fetchClasses();
    window.addEventListener('course_updated', fetchClasses);
    window.addEventListener('focus', fetchClasses);
    return () => {
      window.removeEventListener('course_updated', fetchClasses);
      window.removeEventListener('focus', fetchClasses);
    };
  }, []);

  const filteredClips = selectedCourseFilter === 'ALL'
    ? allClips
    : allClips.filter((c) => c.courseCode === selectedCourseFilter);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-16 font-sans text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-white">
        <div className="z-10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#CEF34B]/20 border border-[#CEF34B]/40 flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-[#CEF34B]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">คลาสที่เปิดสอน</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">รวมคลาสเรียนและสื่อการสอนที่ผ่านการอนุมัติ — {allClips.length} คลิปวิดีโอ ({courseFilters.length - 1} รายวิชา)</p>
          </div>
        </div>
        <Link href="/professor" className="z-10 flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#CEF34B] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>กลับแดชบอร์ด</span>
        </Link>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CEF34B]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Course Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {courseFilters.map((f) => (
          <button
            key={f.code}
            onClick={() => setSelectedCourseFilter(f.code)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedCourseFilter === f.code
                ? 'bg-slate-900 text-[#CEF34B] shadow-xs'
                : 'text-slate-600 hover:text-black hover:bg-slate-100 bg-transparent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClips.map((clip) => (
          <div key={clip.id} className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <div onClick={() => setActiveVideoModal(clip)} className="h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 relative flex flex-col justify-between text-white cursor-pointer group-hover:brightness-105 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
                <div className="flex items-center justify-between z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/60 text-[#CEF34B] border border-[#CEF34B]/30 backdrop-blur-md">{clip.courseCode} • {clip.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md flex items-center gap-1"><Clock className="w-3 h-3 text-[#CEF34B]" />{clip.durationText}</span>
                </div>
                <div className="flex items-center justify-center my-auto z-10">
                  <div className="w-12 h-12 rounded-full bg-[#CEF34B] text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-5 h-5 ml-0.5 fill-black text-black" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 z-10">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400"><CheckCircle className="w-3.5 h-3.5" />อนุมัติเผยแพร่แล้ว</span>
                  <span className="text-slate-400">{clip.fileSizeText}</span>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">{clip.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{clip.description}</p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button type="button" onClick={() => setActiveVideoModal(clip)} className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-[#CEF34B] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs">
                <Play className="w-3.5 h-3.5 fill-[#CEF34B]" />
                <span>เปิดดูคลิปวิดีโอ</span>
              </button>
              <Link href={`/learning/${clip.courseId || 'course-1'}`} className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors" title="ไปที่ห้องเรียน">
                <span>ห้องเรียน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activeVideoModal && (
        <Modal isOpen={!!activeVideoModal} onClose={() => setActiveVideoModal(null)} title={activeVideoModal.title} maxWidth="xl">
          <div className="space-y-4">
            <VideoPlayer src={activeVideoModal.videoUrl || ''} title={activeVideoModal.title} className="w-full rounded-2xl overflow-hidden" />
            <div className="space-y-1 px-1">
              <p className="text-xs text-slate-500 font-medium">{activeVideoModal.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span>{activeVideoModal.courseCode} • {activeVideoModal.category}</span>
                <span>•</span>
                <span>{activeVideoModal.durationText}</span>
                <span>•</span>
                <span>อัปโหลด {activeVideoModal.uploadDate}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
