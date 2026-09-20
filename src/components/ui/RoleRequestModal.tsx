'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, UserCheck, BookOpen, GraduationCap, Eye, 
  Send, Trash2, Clock, CheckCircle2, AlertCircle, AlertTriangle, 
  ChevronRight, Sparkles 
} from 'lucide-react';
import { RoleName } from '@/lib/rbac';

interface RoleOptionInfo {
  name: RoleName;
  title: string;
  badgeTitle: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}

const AVAILABLE_REQUEST_ROLES: RoleOptionInfo[] = [
  {
    name: 'COURSE_CREATOR_APPROVER',
    title: 'ผู้อนุมัติหลักสูตรและสื่อการเรียนรู้',
    badgeTitle: 'ผู้อนุมัติ',
    description: 'สิทธิ์ในการตรวจสอบ พิจารณา และอนุมัติเปิดรายวิชา รวมถึงสื่อการเรียนรู้ทั้งหมด',
    icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
    colorClass: 'border-amber-400/50 bg-amber-500/10 text-amber-900',
  },
  {
    name: 'PROFESSOR',
    title: 'อาจารย์ผู้สอน',
    badgeTitle: 'อาจารย์',
    description: 'สิทธิ์สร้างคอร์สเรียน อัปโหลดสื่อการสอน ตรวจผลงาน และประเมินผลนักศึกษา',
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
    colorClass: 'border-blue-400/50 bg-blue-500/10 text-blue-900',
  },
  {
    name: 'DIRECTOR',
    title: 'ผู้บริหารสถานศึกษา',
    badgeTitle: 'ผู้บริหาร',
    description: 'สิทธิ์ตรวจสอบสถิติและภาพรวมการบริหารการเรียนการสอน (ดูอย่างเดียว)',
    icon: <Eye className="w-5 h-5 text-rose-500" />,
    colorClass: 'border-rose-400/50 bg-rose-500/10 text-rose-900',
  },
];

interface RoleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  currentRoles: string[];
  onRolesUpdated?: (newRoles: string[]) => void;
}

export const RoleRequestModal: React.FC<RoleRequestModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  currentRoles,
  onRolesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'relinquish' | 'history'>('request');
  const [selectedRoleToRequest, setSelectedRoleToRequest] = useState<RoleName>('COURSE_CREATOR_APPROVER');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Request History State
  const [historyRequests, setHistoryRequests] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Confirm Revoke Dialog State
  const [roleToRevoke, setRoleToRevoke] = useState<string | null>(null);

  // Clean user name from English in parentheses
  const cleanUserName = (userName || '').replace(/\s*\([A-Za-z0-9\s\.\-]+\)/g, '').trim();

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setStatusMessage(null);
    }
  }, [isOpen, userEmail]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/roles/request?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.requests) {
        setHistoryRequests(data.requests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  // Roles available for request (user doesn't currently possess)
  const eligibleRolesToRequest = AVAILABLE_REQUEST_ROLES.filter(
    (r) => !currentRoles.includes(r.name) && !(r.name === 'COURSE_CREATOR_APPROVER' && currentRoles.includes('APPROVER'))
  );

  // Roles available for relinquish (exclude STUDENT as it is default baseline)
  const relinquishingRoles = currentRoles.filter((r) => r !== 'STUDENT');

  const getRoleThaiName = (rName: string) => {
    switch (rName) {
      case 'STUDENT': return 'นักศึกษา';
      case 'COURSE_CREATOR_APPROVER':
      case 'APPROVER': return 'ผู้อนุมัติหลักสูตรและสื่อ';
      case 'PROFESSOR': return 'อาจารย์ผู้สอน';
      case 'DIRECTOR': return 'ผู้บริหารสถานศึกษา';
      case 'REGISTRAR': return 'นายทะเบียน';
      default: return rName;
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleToRequest) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/roles/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          roleName: selectedRoleToRequest,
          requestType: 'GRANT',
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาดในการส่งคำขอ' });
      } else {
        setStatusMessage({ type: 'success', text: data.message || 'ส่งคำขอรับสิทธิ์สำเร็จแล้ว' });
        setReason('');
        fetchHistory();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantRevoke = async (roleName: string) => {
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/roles/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          roleName,
          requestType: 'REVOKE',
          instantRevoke: true,
          reason: 'ผู้ใช้งานดำเนินการยกเลิกสิทธิ์ด้วยตนเองผ่านเมนูส่วนตัว',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'ไม่สามารถยกเลิกบทบาทได้' });
      } else {
        setStatusMessage({ type: 'success', text: `ยกเลิกสิทธิ์ ${getRoleThaiName(roleName)} เรียบร้อยแล้ว` });
        setRoleToRevoke(null);
        if (data.roles && onRolesUpdated) {
          onRolesUpdated(data.roles);
        }
        window.dispatchEvent(new Event('role_updated'));
        fetchHistory();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CEF34B]/20 text-[#CEF34B] border border-[#CEF34B]/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                ขอสิทธิ์
              </h2>
              <p className="text-xs text-slate-400">
                ผู้ใช้งาน: <span className="text-white font-bold">{cleanUserName}</span> ({userEmail})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-slate-50 px-6 pt-3.5 pb-2.5 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('request'); setStatusMessage(null); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'request'
                ? 'bg-slate-900 text-[#CEF34B] shadow-md font-extrabold'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ขอรับสิทธิ์บทบาท</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('relinquish'); setStatusMessage(null); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'relinquish'
                ? 'bg-slate-900 text-[#CEF34B] shadow-md font-extrabold'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>ยกเลิกสิทธิ์ที่เป็นอยู่ ({relinquishingRoles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('history'); setStatusMessage(null); fetchHistory(); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-900 text-[#CEF34B] shadow-md font-extrabold'
                : 'bg-white text-slate-600 hover:text-black border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ประวัติคำขอ ({historyRequests.length})</span>
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: ขอรับสิทธิ์บทบาท */}
          {activeTab === 'request' && (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-800">
                  เลือกบทบาทที่ต้องการยื่นคำขอรับสิทธิ์:
                </label>
              </div>

              {eligibleRolesToRequest.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">
                    คุณมีสิทธิ์ครบทุกบทบาทที่สามารถขอได้แล้วในขณะนี้
                  </p>
                  <p className="text-xs text-slate-500">
                    บทบาทปัจจุบันของคุณ: {currentRoles.map(getRoleThaiName).join(', ')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {eligibleRolesToRequest.map((roleOpt) => {
                    const isSelected = selectedRoleToRequest === roleOpt.name;
                    return (
                      <div
                        key={roleOpt.name}
                        onClick={() => setSelectedRoleToRequest(roleOpt.name)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200 flex-shrink-0">
                          {roleOpt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-900 tracking-tight">
                              {roleOpt.title}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleOpt.colorClass}`}>
                              {roleOpt.badgeTitle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {roleOpt.description}
                          </p>
                        </div>
                        <div className="flex items-center pt-1">
                          <input
                            type="radio"
                            name="selectedRole"
                            checked={isSelected}
                            onChange={() => setSelectedRoleToRequest(roleOpt.name)}
                            className="w-4 h-4 text-slate-900 accent-slate-900 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {eligibleRolesToRequest.length > 0 && (
                <>
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-extrabold text-slate-800">
                      เหตุผลประกอบการขอรับสิทธิ์ (ถ้ามี):
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="ระบุเหตุผลหรือรายละเอียดเพิ่มเติมในการขอรับสิทธิ์..."
                      className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-800"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-black text-[#CEF34B] text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอรับสิทธิ์'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* TAB 2: ยกเลิกสิทธิ์ที่เป็นอยู่ */}
          {activeTab === 'relinquish' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  คุณสามารถกดยกเลิกสิทธิ์ที่เป็นอยู่ออกได้ทันที 
                  เมื่อยกเลิกแล้ว สิทธิ์นั้นจะถูกปลดออกจากบัญชีของคุณทันที
                </div>
              </div>

              {relinquishingRoles.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    คุณไม่มีบทบาทเสริมที่สามารถยกเลิกได้ในขณะนี้
                  </p>
                  <p className="text-[11px] text-slate-500">
                    (บทบาทนักศึกษาเป็นบทบาทพื้นฐาน ไม่สามารถยกเลิกได้)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {relinquishingRoles.map((roleName) => {
                    const isApprover = roleName === 'COURSE_CREATOR_APPROVER' || roleName === 'APPROVER';
                    const isProfessor = roleName === 'PROFESSOR';
                    const isDirector = roleName === 'DIRECTOR';

                    return (
                      <div
                        key={roleName}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                            {isApprover ? <ShieldCheck className="w-5 h-5 text-amber-600" /> :
                             isProfessor ? <BookOpen className="w-5 h-5 text-blue-600" /> :
                             isDirector ? <Eye className="w-5 h-5 text-rose-600" /> :
                             <UserCheck className="w-5 h-5 text-slate-700" />}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block">
                              {getRoleThaiName(roleName)}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              สถานะ: <span className="text-emerald-600 font-bold">เปิดใช้งานอยู่</span>
                            </span>
                          </div>
                        </div>

                        {roleToRevoke === roleName ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-600">ยืนยันยกเลิก?</span>
                            <button
                              type="button"
                              onClick={() => handleInstantRevoke(roleName)}
                              disabled={isSubmitting}
                              className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                            >
                              {isSubmitting ? 'กำลังปลด...' : 'ใช่, ปลดสิทธิ์'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRoleToRevoke(null)}
                              className="px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              ไม่
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRoleToRevoke(roleName)}
                            className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ยกเลิกบทบาทนี้ออก</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ประวัติคำขอ */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="p-6 text-center text-xs text-slate-500 font-bold">
                  กำลังโหลดข้อมูลประวัติคำขอ...
                </div>
              ) : historyRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  ไม่มีประวัติการขอสิทธิ์หรือยกเลิกสิทธิ์
                </div>
              ) : (
                historyRequests.map((req) => {
                  const isApproved = req.status === 'APPROVED';
                  const isRejected = req.status === 'REJECTED';
                  const isPending = req.status === 'PENDING';

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {req.requestType === 'GRANT' ? '➕ ขอรับสิทธิ์:' : '➖ ขอยกเลิกสิทธิ์:'} {getRoleThaiName(req.roleName)}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          isRejected ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {isApproved ? 'อนุมัติแล้ว' :
                           isRejected ? 'ปฏิเสธ' :
                           'รอดำเนินการ'}
                        </span>
                      </div>

                      {req.reason && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong>เหตุผล:</strong> {req.reason}
                        </p>
                      )}

                      {req.reviewNote && (
                        <p className="text-xs text-slate-500 italic">
                          หมายเหตุ: {req.reviewNote}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-400">
                        ยื่นคำขอเมื่อ: {new Date(req.createdAt).toLocaleString('th-TH')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ระบบสารสนเทศการเรียนรู้ มหาวิทยาลัย Xการช่าง</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
