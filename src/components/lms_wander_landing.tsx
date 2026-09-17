'use client';

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Instagram, 
  Twitter, 
  Facebook, 
  Compass, 
  CalendarCheck, 
  Headphones, 
  Award, 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  Sparkles,
  Wrench,
  GraduationCap,
  BookOpen,
  UserCheck,
  Eye,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type FontOption = 'outfit-prompt' | 'jakarta-ibm' | 'inter-kanit' | 'playfair-prompt';

interface LMSCourse {
  id: string;
  code: string;
  title: string;
  category: string;
  instructor: string;
  department: string;
  price: string;
  rating: number;
  studentsCount: string;
  imageUrl: string;
  description: string;
  modules: string[];
}

const LMS_COURSES: LMSCourse[] = [
  {
    id: 'ev-auto',
    code: 'ME-401',
    title: 'วิศวกรรมยานยนต์ไฟฟ้าและเทคโนโลยีแบตเตอรี่ (EV Engineering)',
    category: 'วิศวกรรมเครื่องกล & ยานยนต์',
    instructor: 'ผศ.ดร.วิชาญ สอนดี',
    department: 'สาขาวิชายานยนต์สมัยใหม่',
    price: '฿4,999',
    rating: 4.9,
    studentsCount: '1.2k คน',
    imageUrl: '/images/hero_wander.jpg',
    description: 'เรียนรู้โครงสร้างระบบขับเคลื่อน EV เทคโนโลยี Battery Management System (BMS) และการตรวจวิเคราะห์ความปลอดภัยในยานยนต์ไฟฟ้าขั้นสูง',
    modules: ['หลักการทำงาน มอเตอร์ และ Inverter', 'การออกแบบแพ็กแบตเตอรี่ Lithium-ion', 'ระบบชาร์จและตู้ประจุไฟ EV', 'งานซ่อมบำรุงตามมาตรฐานความปลอดภัย']
  },
  {
    id: 'plc-robotics',
    code: 'EE-302',
    title: 'ระบบการผลิตอัตโนมัติและหุ่นยนต์อุตสาหกรรม (PLC & Robotics)',
    category: 'วิศวกรรมไฟฟ้า & ระบบวัด',
    instructor: 'อ.สมศักดิ์ นวัตกรรม',
    department: 'สาขาไฟฟ้าอุตสาหกรรม',
    price: '฿3,200',
    rating: 4.8,
    studentsCount: '850 คน',
    imageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800&auto=format&fit=crop',
    description: 'ฝึกเขียนโปรแกรม PLC (Siemens/Mitsubishi) ควบคุมสายการผลิตอัตโนมัติ ปรับแต่งแขนกลหุ่นยนต์อุตสาหกรรม และระบบ SCADA',
    modules: ['การเขียนโปรแกรม Ladder Logic', 'Interfacing Sensors & Actuators', 'การควบคุมแขนกล 6 แกน', 'ระบบสื่อสารอุตสาหกรรม Modbus/PROFINET']
  },
  {
    id: 'adv-welding',
    code: 'MT-205',
    title: 'เทคนิคการเชื่อมโครงสร้างทนแรงดันสูง (Advanced Pressure Vessel Welding)',
    category: 'เทคโนโลยีการเชื่อม & โลหะการ',
    instructor: 'อาจารย์ช่าง เกรียงไกร',
    department: 'สาขาเทคโนโลยีโลหะ',
    price: '฿3,900',
    rating: 4.9,
    studentsCount: '2.1k คน',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop',
    description: 'หลักสูตรเชื่อม TIG/MIG และการตรวจสอบรอยเชื่อมแบบไม่ทำลายสภาพ (NDT Test) สำหรับโครงสร้างท่อทนแรงดันสูงตามมาตรฐานสากล',
    modules: ['การเชื่อม TIG สแตนเลสและท่อเหล็กทนแรงดัน', 'การวิเคราะห์รอยเชื่อม NDT Ultrasonic', 'มาตรฐานการเชื่อม ASME & AWS', 'ความปลอดภัยในงานเชื่อมความเสี่ยงสูง']
  },
  {
    id: 'cad-cam',
    code: 'CE-108',
    title: 'การเขียนแบบและสร้างแบบจำลอง 3 มิติเชิงวิศวกรรม (CAD/CAM Masterclass)',
    category: 'สถาปัตยกรรม & ออกแบบช่าง',
    instructor: 'ดร.กิตติศักดิ์ ออกแบบ',
    department: 'สาขาเขียนแบบเครื่องกล',
    price: '฿4,200',
    rating: 4.7,
    studentsCount: '780 คน',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop',
    description: 'สร้างโมเดลชิ้นส่วนเครื่องกล 3 มิติ ด้วย SolidWorks / Fusion 360 พร้อมแปลงโค้ด G-Code ควบคุมเครื่องจักร CNC 5 แกน',
    modules: ['3D Parametric Modeling', 'Assembly & Motion Simulation', 'การสร้าง G-Code สำหรับ CNC', 'Reverse Engineering & 3D Scanning']
  }
];

export default function LmsWanderLanding() {
  const router = useRouter();
  const [currentFont, setCurrentFont] = useState<FontOption>('outfit-prompt');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<LMSCourse | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [savedCourses, setSavedCourses] = useState<string[]>(['ev-auto']);

  const fontClassMap: Record<FontOption, string> = {
    'outfit-prompt': 'font-combo-outfit-prompt',
    'jakarta-ibm': 'font-combo-jakarta-ibm',
    'inter-kanit': 'font-combo-inter-kanit',
    'playfair-prompt': 'font-combo-playfair-prompt'
  };

  const categories = ['ทั้งหมด', 'วิศวกรรมเครื่องกล & ยานยนต์', 'วิศวกรรมไฟฟ้า & ระบบวัด', 'เทคโนโลยีการเชื่อม & โลหะการ', 'สถาปัตยกรรม & ออกแบบช่าง'];

  const filteredCourses = LMS_COURSES.filter(course => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSaveCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedCourses(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleQuickRoleLogin = (email: string) => {
    localStorage.setItem('demo_user_email', email);
    if (email.includes('registrar')) {
      router.push('/registrar');
    } else if (email.includes('director')) {
      router.push('/director');
    } else if (email.includes('prof')) {
      router.push('/professor');
    } else if (email.includes('approver')) {
      router.push('/course-approver');
    } else {
      router.push('/student');
    }
  };

  return (
    <div className={`min-h-screen bg-[#f3f4f6] text-[#0f172a] transition-all duration-300 ${fontClassMap[currentFont]}`}>

      {/* Floating Font Selector Switcher Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300 hidden sm:inline">ระบบเลือกฟอนต์ มหาวิทยาลัย Xการช่าง:</span>
            <span className="text-amber-300 font-semibold">ปรับแบบอักษรสวยงาม (Font Pairings)</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setCurrentFont('outfit-prompt')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                currentFont === 'outfit-prompt' 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Outfit + Prompt (โมเดิร์น)
            </button>
            <button
              onClick={() => setCurrentFont('jakarta-ibm')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                currentFont === 'jakarta-ibm' 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Plus Jakarta + IBM Plex (ลักชัวรี)
            </button>
            <button
              onClick={() => setCurrentFont('inter-kanit')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                currentFont === 'inter-kanit' 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Inter + Kanit (คลีนสปอร์ต)
            </button>
            <button
              onClick={() => setCurrentFont('playfair-prompt')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                currentFont === 'playfair-prompt' 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Playfair + Prompt (เอเลแกนท์)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
            >
              🔑 เลือกเข้าใช้งาน 5 บทบาท
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Container Padded */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">

        {/* TOP NAVBAR HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="X Engineering Logo" className="h-12 w-auto object-contain" />
            <div>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">LMS</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">ระบบสารสนเทศการเรียนรู้ออนไลน์ชั้นนำ</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#home" className="text-slate-950 hover:text-black border-b-2 border-slate-900 pb-0.5">หน้าแรก</a>
            <a href="#courses" className="hover:text-slate-950 transition-colors">หลักสูตรช่างทั้งหมด</a>
            <a href="#about" className="hover:text-slate-950 transition-colors">เกี่ยวกับสถาบัน</a>
            <a href="#contact" className="hover:text-slate-950 transition-colors">ติดต่อสอบถาม</a>
          </nav>

          {/* Search Bar & Action Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="relative flex items-center bg-white border border-slate-300 rounded-full px-4 py-2.5 shadow-sm hover:border-slate-400 cursor-pointer w-full md:w-[300px] transition-all"
            >
              <input 
                type="text" 
                readOnly
                placeholder="ค้นหาคอร์สเรียน, รหัสวิชา, สาขา..."
                className="bg-transparent text-sm text-slate-700 outline-none w-full cursor-pointer placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
            </div>

            <Link 
              href="/login"
              className="bg-[#1e293b] hover:bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            >
              เข้าสู่ระบบ (Login)
            </Link>
          </div>
        </header>

        {/* HERO BANNER SECTION (WANDER Aesthetic Theme for X-Karchang University) */}
        <section id="home" className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[480px] sm:min-h-[540px] flex items-end shadow-xl">
          {/* Background Image & Gradient Vignette */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/images/hero_wander.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-900/20" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-4xl space-y-5 text-white">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-300/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              มหาวิทยาลัย Xการช่าง — สารสนเทศการเรียนรู้ออนไลน์ระดับสถาบัน
            </div>

            <div className="flex items-center gap-4 pt-1">
              <img src="/images/logo.png" alt="X Engineering Logo" className="h-24 sm:h-32 w-auto object-contain drop-shadow-xl bg-white/10 p-2 rounded-2xl backdrop-blur-xs" />
            </div>

            <p className="text-base sm:text-lg md:text-xl font-normal text-slate-100 max-w-2xl leading-relaxed drop-shadow">
              ยกระดับทักษะวิศวกรรม นวัตกรรมช่าง และสารสนเทศการเรียนรู้ออนไลน์ชั้นนำของประเทศ รองรับระบบบริหารบทบาทนักเรียน อาจารย์ นายทะเบียน และผู้บริหารครบวงจร
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link 
                href="/login"
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base px-7 py-3 rounded-full shadow-md transition-all transform hover:-translate-y-0.5"
              >
                เข้าสู่ระบบเรียนออนไลน์
              </Link>

              <button 
                onClick={() => {
                  const elem = document.getElementById('courses');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-full transition-all"
              >
                สำรวจหลักสูตรทั้งหมด
              </button>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE X-KARCHANG LMS SECTION (Layout matching reference design) */}
        <section id="about" className="py-8 sm:py-12 px-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Heading, Bio, Socials & Stats */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  ทำไมผู้เรียนกว่าหมื่นคนจึงเลือก มหาวิทยาลัย Xการช่าง สำหรับอนาคตสายอาชีพ
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  จากหลักสูตรปฏิบัติจริง สู่นวัตกรรมระดับอุตสาหกรรม เรียนรู้ได้ตลอด 24 ชั่วโมง พร้อมระบบอนุมัติ ส่งการบ้าน และประเมินผลมาตรฐานสถาบัน
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-3 pt-2">
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-900 hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center sm:text-left space-y-1">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">12k+</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">นักศึกษาและช่างฝีมือสำเร็จการศึกษา</div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">10Yrs+</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">ประสบการณ์บริหารการศึกษาสายอาชีพ</div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">50+</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">หลักสูตรช่างและวิศวกรรมศาสตร์</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3 Feature Cards Stack (Soft Slate Blue tone matching screenshot) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Feature 1 */}
              <div className="bg-[#8b9bb4] text-white p-6 rounded-2xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                  <Compass className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">ผู้เชี่ยวชาญสายอาชีพ</h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    เรียนกับอาจารย์ผู้เชี่ยวชาญและวิศวกรจากภาคอุตสาหกรรม ถ่ายทอดความรู้ตรงจากสนามจริง
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#7888a3] text-white p-6 rounded-2xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">ระบบเรียนครบจบในที่เดียว</h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    ลงทะเบียน ส่งงานออนไลน์ ตรวจสอบเกรด และรับวุฒิบัตรในระบบดิจิทัลเดียวของสถาบัน
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#6b7b96] text-white p-6 rounded-2xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">ดูแลและสนับสนุน 24/7</h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    เจ้าหน้าที่นายทะเบียนและอาจารย์ที่ปรึกษาพร้อมให้ความช่วยเหลือด้านวิชาการตลอดเวลา
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TOP COURSES CATALOG SECTION (Top Destinations Showcase in reference UI) */}
        <section id="courses" className="bg-[#e5e7eb]/80 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">หลักสูตรช่างและวิศวกรรมยอดนิยม</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 max-w-md">
              ยกระดับทักษะฝีมือช่างด้วยหลักสูตรการเรียนที่ทันสมัยและผ่านการรับรองจาก มหาวิทยาลัย Xการช่าง
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCourses.map(course => {
              const isSaved = savedCourses.includes(course.id);

              return (
                <div 
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="group relative bg-slate-900 rounded-2xl overflow-hidden h-[390px] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between p-4"
                >
                  {/* Card Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${course.imageUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/40" />

                  {/* Card Header (Top Badge & Code) */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                      {course.code}
                    </span>

                    <button 
                      onClick={(e) => toggleSaveCourse(course.id, e)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isSaved ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Card Footer (Bottom Info) */}
                  <div className="relative z-10 space-y-2 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">{course.department}</span>
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight line-clamp-2 leading-snug">{course.title}</h3>

                    <div className="flex items-center justify-between pt-1 border-t border-white/20 text-xs">
                      <span className="text-slate-300">{course.instructor}</span>
                      <span className="font-extrabold text-amber-300 text-sm">{course.price}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-4">
            <Link 
              href="/login"
              className="bg-[#1e293b] hover:bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all"
            >
              ดูหลักสูตรทั้งหมดและลงทะเบียน
            </Link>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-slate-400 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-slate-400 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center text-xs text-slate-500 border-t border-slate-300">
          <p>© 2026 มหาวิทยาลัย Xการช่าง (X-Mechanics University LMS Platform). All Rights Reserved.</p>
        </footer>

      </div>

      {/* QUICK ROLE SELECTOR MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>เลือกบทบาทเพื่อเข้าทดสอบระบบ มหาวิทยาลัย Xการช่าง</span>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ระบบรองรับการแสดงผลหน้าเว็บเฉพาะของทั้ง 5 บทบาทผู้ใช้งานหลัก ดังนี้:
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => handleQuickRoleLogin('student@student.x-karchang.ac.th')}
                className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-left border border-emerald-200 text-slate-900 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600" /> 1. นักเรียน / นักศึกษา (Student)
                  </span>
                  <span className="text-slate-500 text-xs block mt-0.5">เข้าดูคอร์ส ส่งการบ้าน ดูเกรด</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                onClick={() => handleQuickRoleLogin('professor@x-karchang.ac.th')}
                className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-left border border-amber-200 text-slate-900 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" /> 2. อาจารย์ / ครูผู้สอน (Professor)
                  </span>
                  <span className="text-slate-500 text-xs block mt-0.5">จัดการวิชา สร้างบทเรียน ตรวจงาน</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-700" />
              </button>

              <button
                onClick={() => handleQuickRoleLogin('course.approver@x-karchang.ac.th')}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-left border border-blue-200 text-slate-900 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-blue-800 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> 3. คนอนุมัติคอร์ส (Approver)
                  </span>
                  <span className="text-slate-500 text-xs block mt-0.5">พิจารณาและอนุมัติเนื้อหาหลักสูตร</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-700" />
              </button>

              <button
                onClick={() => handleQuickRoleLogin('director@x-karchang.ac.th')}
                className="w-full p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-left border border-rose-200 text-slate-900 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-rose-800 text-sm flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-rose-600" /> 4. ผู้อำนวยการ (Director)
                  </span>
                  <span className="text-slate-500 text-xs block mt-0.5">ดูแดชบอร์ดภาพรวมและรายงานบริหาร</span>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-700" />
              </button>

              <button
                onClick={() => handleQuickRoleLogin('registrar@x-karchang.ac.th')}
                className="w-full p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-left border border-indigo-200 text-slate-900 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-indigo-800 text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> 5. นายทะเบียน (Registrar)
                  </span>
                  <span className="text-slate-500 text-xs block mt-0.5">อนุมัติคำขอลงทะเบียนและจัดการบัญชี</span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-700" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURSE DETAIL MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 animate-fadeIn">
            {/* Header Cover */}
            <div className="relative h-60 w-full">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${selectedCourse.imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent" />
              
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full">
                  {selectedCourse.code} • {selectedCourse.category}
                </span>
                <h3 className="text-2xl font-black leading-tight">{selectedCourse.title}</h3>
                <p className="text-xs text-slate-200">{selectedCourse.department} • สอนโดย {selectedCourse.instructor}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <div className="text-xs text-slate-500 font-medium">ค่าธรรมเนียมการเรียน</div>
                  <div className="text-2xl font-black text-slate-900">{selectedCourse.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">คะแนนหลักสูตร</div>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedCourse.rating}</span>
                    <span className="text-slate-400 font-normal">({selectedCourse.studentsCount})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">รายละเอียดวิชา</h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{selectedCourse.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">หัวข้อบทเรียนหลัก (Modules)</h4>
                <div className="space-y-2">
                  {selectedCourse.modules.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-100 p-3 rounded-xl font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ปิด
                </button>
                <Link 
                  href="/login"
                  className="bg-slate-900 hover:bg-black text-amber-400 font-bold text-sm px-8 py-2.5 rounded-full shadow-md transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> เข้าสู่ระบบเพื่อลงทะเบียนเรียน
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
