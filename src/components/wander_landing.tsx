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
  Type,
  X,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

// Types
type FontOption = 'outfit-prompt' | 'jakarta-ibm' | 'inter-kanit' | 'playfair-prompt';

interface Destination {
  id: string;
  name: string;
  category: string;
  tagline: string;
  region: string;
  price: string;
  rating: number;
  reviewsCount: string;
  imageUrl: string;
  description: string;
  highlights: string[];
}

const DESTINATIONS: Destination[] = [
  {
    id: 'el-nido',
    name: 'El Nido',
    category: 'Beach & Islands',
    tagline: 'Beach paradise',
    region: 'Palawan, Region',
    price: '₱4,999',
    rating: 4.9,
    reviewsCount: '1.2k',
    imageUrl: '/images/elnido.jpg',
    description: 'El Nido is known for its dramatic limestone cliffs, secret beaches, turquoise lagoons, and world-class scuba diving spots.',
    highlights: ['Big & Small Lagoon Tour', 'Nacpan Beach Sunset', 'Island Hopping Tour A & C', 'Scuba Diving']
  },
  {
    id: 'baguio',
    name: 'Baguio City',
    category: 'Mountain Getaways',
    tagline: 'Nature Getaway',
    region: 'Benguet, Region',
    price: '₱3,200',
    rating: 4.8,
    reviewsCount: '850',
    imageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800&auto=format&fit=crop',
    description: 'The Summer Capital of the Philippines, nestled in pine-covered mountains with cool weather, strawberry farms, and vibrant art culture.',
    highlights: ['Strawberry Farm Picking', 'Burnham Park Boating', 'Camp John Hay Trail', 'Mines View Park']
  },
  {
    id: 'siargao',
    name: 'Siargao',
    category: 'Surfing & Adventure',
    tagline: 'Surf & Chill',
    region: 'Surigao del Norte, Region',
    price: '₱3,900',
    rating: 4.9,
    reviewsCount: '2.1k',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    description: 'The surfing capital of the Philippines featuring world-famous Cloud 9 wave break, palm tree rope swings, and crystal clear tide pools.',
    highlights: ['Cloud 9 Surf Session', 'Magpupungko Rock Pools', 'Sugba Lagoon Kayaking', 'Guyam & Daku Island']
  },
  {
    id: 'vigan',
    name: 'Vigan',
    category: 'Cultural Heritage',
    tagline: 'Heritage City',
    region: 'Ilocos Sur, Region',
    price: '₱4,200',
    rating: 4.7,
    reviewsCount: '780',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    description: 'A UNESCO World Heritage city famous for its preserved Spanish colonial architecture, cobblestone streets, and traditional carriage rides.',
    highlights: ['Calle Crisologo Walk', 'Kalesa Heritage Tour', 'Empanada Tasting', 'Syquia Mansion']
  },
  {
    id: 'coron',
    name: 'Coron Island',
    category: 'Beach & Islands',
    tagline: 'Wreck Diving & Lakes',
    region: 'Palawan, Region',
    price: '₱5,400',
    rating: 4.95,
    reviewsCount: '1.8k',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
    description: 'Famous for Kayangan Lake, WWII shipwrecks underwater, thermal hot springs, and breathtaking emerald green waters.',
    highlights: ['Kayangan Lake Trek', 'Twin Lagoon Swim', 'WWII Shipwreck Snorkel', 'Maquinit Hot Springs']
  },
  {
    id: 'bohol',
    name: 'Bohol',
    category: 'Nature & Wildlife',
    tagline: 'Chocolate Hills',
    region: 'Visayas Region',
    price: '₱3,800',
    rating: 4.85,
    reviewsCount: '1.4k',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    description: 'Home to over 1,000 symmetrical Chocolate Hills, tiny Tarsier primates, and tranquil Loboc River lunch cruises.',
    highlights: ['Chocolate Hills Viewpoint', 'Tarsier Sanctuary', 'Loboc River Cruise', 'Panglao Beach']
  }
];

export default function WanderLanding() {
  const [currentFont, setCurrentFont] = useState<FontOption>('outfit-prompt');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [bookSuccess, setBookSuccess] = useState<boolean>(false);
  const [savedFavorites, setSavedFavorites] = useState<string[]>(['el-nido']);

  // Font CSS class map
  const fontClassMap: Record<FontOption, string> = {
    'outfit-prompt': 'font-combo-outfit-prompt',
    'jakarta-ibm': 'font-combo-jakarta-ibm',
    'inter-kanit': 'font-combo-inter-kanit',
    'playfair-prompt': 'font-combo-playfair-prompt'
  };

  const categories = ['All', 'Beach & Islands', 'Mountain Getaways', 'Surfing & Adventure', 'Cultural Heritage', 'Nature & Wildlife'];

  const filteredDestinations = DESTINATIONS.filter(dest => {
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dest.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className={`min-h-screen bg-[#f3f4f6] text-[#0f172a] transition-all duration-300 ${fontClassMap[currentFont]}`}>

      {/* Floating Font Selector Switcher Bar */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300 hidden sm:inline">UX/UI Typography Controller:</span>
            <span className="text-amber-300 font-semibold">ปรับเลือกฟอนต์สวยงาม (Font Pairings)</span>
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

          <Link 
            href="/login"
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors ml-auto sm:ml-0"
          >
            LMS Portal →
          </Link>
        </div>
      </div>

      {/* Main Container Container Padded */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">

        {/* TOP NAVBAR HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center tracking-tighter">
              <span className="text-3xl font-black text-slate-900 tracking-wider">WANDER</span>
              <span className="text-sm font-bold text-slate-500 ml-0.5 bg-slate-200 px-1.5 py-0.5 rounded">.ph</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#home" className="text-slate-950 hover:text-black border-b-2 border-slate-900 pb-0.5">Home</a>
            <a href="#destinations" className="hover:text-slate-950 transition-colors">Destinations</a>
            <a href="#packages" className="hover:text-slate-950 transition-colors">Packages</a>
            <a href="#blog" className="hover:text-slate-950 transition-colors">Blog</a>
            <a href="#about" className="hover:text-slate-950 transition-colors">About Us</a>
          </nav>

          {/* Search Bar & Action Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="relative flex items-center bg-white border border-slate-300 rounded-full px-4 py-2.5 shadow-sm hover:border-slate-400 cursor-pointer w-full md:w-[320px] transition-all"
            >
              <input 
                type="text" 
                readOnly
                placeholder="Search for a place, city, or destination..."
                className="bg-transparent text-sm text-slate-700 outline-none w-full cursor-pointer placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
            </div>

            <button 
              onClick={() => setSelectedDestination(DESTINATIONS[0])}
              className="bg-[#1e293b] hover:bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            >
              Book now
            </button>
          </div>
        </header>

        {/* HERO BANNER SECTION */}
        <section id="home" className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden min-h-[460px] sm:min-h-[520px] flex items-end shadow-xl">
          {/* Background Image & Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url('/images/hero_wander.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-900/10" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-3xl space-y-5 text-white">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none drop-shadow-md">
              WANDER<span className="text-3xl sm:text-5xl font-extrabold text-amber-300 opacity-90">.PH</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl font-normal text-slate-100 max-w-2xl leading-relaxed drop-shadow">
              Discover breathtaking destinations across the Philippines with curated tours, local insights, and hassle-free planning all in one platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button 
                onClick={() => {
                  const elem = document.getElementById('destinations');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base px-7 py-3 rounded-full shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Plan Your Trip
              </button>

              <button 
                onClick={() => {
                  const elem = document.getElementById('why-choose');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-full transition-all"
              >
                Explore Destinations
              </button>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE WANDER SECTION */}
        <section id="why-choose" className="py-8 sm:py-12 px-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Heading, Bio, Socials & Stats */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  Why Thousands of Travelers Choose WANDER.ph for Their Philippine Adventures
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  From pristine beaches to cultural hotspots, we make exploring the Philippines easier, safer, and more exciting with expert-crafted itineraries and round-the-clock support.
                </p>

                {/* Social Media Links */}
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
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">12k</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">Happy and Satisfied Travelers</div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">10Yrs</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">Proven Travel Industry Experience</div>
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 pt-2">50+</div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">Philippine Destinations Covered</div>
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
                  <h3 className="text-xl font-bold mb-1">Local Expertise</h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    Our Filipino travel experts craft unique experiences with inside knowledge you won't find in typical tours.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#7888a3] text-white p-6 rounded-2xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">All-in-One Booking</h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    Book everything in one place — easy, fast, and hassle-free, whether for quick getaways or planned vacations.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#6b7b96] text-white p-6 rounded-2xl shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">24/7 Support</h3>
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                    We're here anytime, anywhere. Get real-time help anytime you need it before, during, or after your trip.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TOP DESTINATIONS SECTION */}
        <section id="destinations" className="bg-[#e5e7eb]/80 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Top Destinations</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 max-w-md">
              From island escapes to cool mountain towns, discover where your next journey will take you
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

          {/* Destination Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredDestinations.map(dest => {
              const isFav = savedFavorites.includes(dest.id);

              return (
                <div 
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest)}
                  className="group relative bg-slate-900 rounded-2xl overflow-hidden h-[380px] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between p-4"
                >
                  {/* Card Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${dest.imageUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30" />

                  {/* Card Header (Top Badge & Heart) */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                      starts at <span className="text-slate-950 font-black">{dest.price}</span>
                    </span>

                    <button 
                      onClick={(e) => toggleFavorite(dest.id, e)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isFav ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Card Footer (Bottom Info) */}
                  <div className="relative z-10 space-y-2 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tight">{dest.name}</h3>
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{dest.rating}</span>
                        <span className="text-slate-300 font-normal">({dest.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-medium text-slate-200">{dest.tagline}</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-red-400" />
                        {dest.region}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pagination / View More Controls */}
          <div className="flex items-center justify-between pt-4">
            <button 
              onClick={() => setSelectedCategory('All')}
              className="bg-[#1e293b] hover:bg-slate-900 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all"
            >
              View more
            </button>

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
          <p>© 2026 WANDER.ph & Institutional LMS Platform. Designed with modern UX/UI standards and typography options.</p>
        </footer>

      </div>

      {/* SEARCH MODAL */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Search className="w-5 h-5 text-indigo-600" />
                <span>Search Destinations & Activities</span>
              </div>
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type city name, region, or activity..."
              className="w-full text-base p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-900"
            />

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Suggestions</div>
              <div className="flex flex-wrap gap-2">
                {['El Nido', 'Baguio', 'Siargao', 'Coron', 'Beach', 'Mountain'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsSearchOpen(false);
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESTINATION DETAIL / BOOKING MODAL */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 animate-fadeIn">
            {/* Header Cover */}
            <div className="relative h-64 w-full">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${selectedDestination.imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent" />
              
              <button 
                onClick={() => {
                  setSelectedDestination(null);
                  setBookSuccess(false);
                }}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-full">
                  {selectedDestination.category}
                </span>
                <h3 className="text-3xl font-black">{selectedDestination.name}</h3>
                <p className="text-xs text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {selectedDestination.region}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {bookSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">Booking Reservation Submitted!</h4>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Your trip reservation for <span className="font-semibold text-slate-900">{selectedDestination.name}</span> has been confirmed. Our local travel advisor will contact you shortly.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedDestination(null);
                      setBookSuccess(false);
                    }}
                    className="mt-4 bg-slate-900 text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Starting Price</div>
                      <div className="text-2xl font-black text-slate-900">{selectedDestination.price} <span className="text-xs font-normal text-slate-500">/ person</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Customer Rating</div>
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{selectedDestination.rating}</span>
                        <span className="text-slate-400 font-normal">({selectedDestination.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">Overview</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedDestination.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900">Tour Highlights</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDestination.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 p-2.5 rounded-lg font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setSelectedDestination(null)}
                      className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => setBookSuccess(true)}
                      className="bg-slate-900 hover:bg-black text-white font-bold text-sm px-8 py-2.5 rounded-full shadow-md transition-all"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
