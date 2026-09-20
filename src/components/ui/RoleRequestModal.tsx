'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, UserCheck, BookOpen, GraduationCap, Eye, 
  Send, Trash2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { RoleName } from '@/lib/rbac';

interface RoleOptionInfo {
  name: RoleName;
  title: string;
  badgeTitle: string;
  icon: React.ReactNode;
  colorClass: string;
}

const ALL_AVAILABLE_ROLES: RoleOptionInfo[] = [
  {
    name: 'PROFESSOR',
    title: 'อาจารย์',
    badgeTitle: 'อาจารย์',
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
    colorClass: 'border-blue-400/50 bg-blue-500/10 text-blue-900',
  },
  {
    name: 'COURSE_CREATOR_APPROVER',
    title: 'คนอนุมัติ',
    badgeTitle: 'คนอนุมัติ',
    icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
    colorClass: 'border-amber-400/50 bg-amber-500/10 text-amber-900',
  },
  {
    name: 'DIRECTOR',
    title: 'ผู้บริหารสถานศึกษา',
    badgeTitle: 'ผู้บริหาร',
    icon: <Eye className="w-5 h-5 text-rose-500" />,
    colorClass: 'border-rose-400/50 bg-rose-500/10 text-rose-900',
  },
  {
    name: 'REGISTRAR',
    title: 'นายทะเบียน',
    badgeTitle: 'นายทะเบียน',
    icon: <UserCheck className="w-5 h-5 text-purple-500" />,
    colorClass: 'border-purple-400/50 bg-purple-500/10 text-purple-900',
  },
  {
    name: 'STUDENT',
    title: 'นักศึกษา',
    badgeTitle: 'นักศึกษา',
    icon: <GraduationCap className="w-5 h-5 text-emerald-500" />,
    colorClass: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-900',
  },
];

interface RoleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName?: string;
  currentRoles: string[];
  onRolesUpdated?: (newRoles: string[]) => void;
}

export const RoleRequestModal: React.FC<RoleRequestModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  currentRoles,
  onRolesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'relinquish'>('request');
  const [rolesList, setRolesList] = useState<string[]>(currentRoles);
  const [selectedRoleToRequest, setSelectedRoleToRequest] = useState<RoleName>('PROFESSOR');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setRolesList(currentRoles);
    if (currentRoles.length <= 1) {
      setActiveTab('request');
    }
  }, [currentRoles]);

  // ทุก role สามารถขอสิทธิ์ role อื่นได้ทั้งหมดตามที่ผู้ใช้ต้องการ
  const candidateRoles = ALL_AVAILABLE_ROLES;

  const eligibleRolesToRequest = candidateRoles.filter(
    (r) => !rolesList.includes(r.name) && !(r.name === 'COURSE_CREATOR_APPROVER' && rolesList.includes('APPROVER'))
  );

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (eligibleRolesToRequest.length > 0 && !eligibleRolesToRequest.some(r => r.name === selectedRoleToRequest)) {
      setSelectedRoleToRequest(eligibleRolesToRequest[0].name);
    }
  }, [eligibleRolesToRequest, selectedRoleToRequest]);

  if (!isOpen) return null;

  const getRoleThaiName = (rName: string) => {
    switch (rName) {
      case 'STUDENT': return 'นักศึกษา';
      case 'COURSE_CREATOR_APPROVER':
      case 'APPROVER': return 'คนอนุมัติ';
      case 'CONTENT_APPROVER': return 'คนอนุมัติสื่อ';
      case 'PROFESSOR': return 'อาจารย์';
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
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant Revoke - removes role immediately without approver intervention
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
          reason: 'ผู้ใช้งานกดยกเลิกสิทธิ์ด้วยตนเอง',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'ไม่สามารถยกเลิกบทบาทได้' });
      } else {
        setStatusMessage({ type: 'success', text: `ยกเลิกสิทธิ์ ${getRoleThaiName(roleName)} เรียบร้อยแล้ว` });
        if (data.roles) {
          setRolesList(data.roles);
          if (onRolesUpdated) {
            onRolesUpdated(data.roles);
          }
        }
        window.dispatchEvent(new Event('role_updated'));
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
        
        {/* Modal Header - Clean, No User Name Line */}
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CEF34B]/20 text-[#CEF34B] border border-[#CEF34B]/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                ขอสิทธิ์
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar - Only show Tab 2 if user has MORE than 1 role */}
        {rolesList.length > 1 && (
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
              <span>ขอรับสิทธิ์</span>
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
              <span>ยกเลิกสิทธิ์ที่เป็นอยู่ ({rolesList.length - 1})</span>
            </button>
          </div>
        )}

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
          
          {/* TAB 1: ขอรับสิทธิ์ */}
          {activeTab === 'request' && (
            <form onSubmit={handleSubmitRequest} className="space-y-4">
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
                <div className="grid grid-cols-1 gap-2.5">
                  {eligibleRolesToRequest.map((roleOpt) => {
                    const isSelected = selectedRoleToRequest === roleOpt.name;
                    return (
                      <div
                        key={roleOpt.name}
                        onClick={() => setSelectedRoleToRequest(roleOpt.name)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900/5 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200 flex-shrink-0">
                            {roleOpt.icon}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                              {roleOpt.title}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleOpt.colorClass}`}>
                              {roleOpt.badgeTitle}
                            </span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="selectedRole"
                          checked={isSelected}
                          onChange={() => setSelectedRoleToRequest(roleOpt.name)}
                          className="w-4 h-4 text-slate-900 accent-slate-900 cursor-pointer"
                        />
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

          {/* TAB 2: ยกเลิกสิทธิ์ที่เป็นอยู่ - Displays all held roles, instant revoke */}
          {activeTab === 'relinquish' && (
            <div className="space-y-3">
              {rolesList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    ไม่มีบทบาทที่เปิดใช้งานอยู่ในขณะนี้
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {rolesList.map((roleName) => {
                    const isApprover = roleName === 'COURSE_CREATOR_APPROVER' || roleName === 'APPROVER';
                    const isProfessor = roleName === 'PROFESSOR';
                    const isDirector = roleName === 'DIRECTOR';
                    const isRegistrar = roleName === 'REGISTRAR';
                    const initialPrimaryRole = currentRoles[0] || rolesList[0];
                    const isOriginalRole = roleName === initialPrimaryRole || rolesList.length <= 1;

                    return (
                      <div
                        key={roleName}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex-shrink-0">
                            {isApprover ? <ShieldCheck className="w-5 h-5 text-amber-600" /> :
                             isProfessor ? <BookOpen className="w-5 h-5 text-blue-600" /> :
                             isDirector ? <Eye className="w-5 h-5 text-rose-600" /> :
                             isRegistrar ? <UserCheck className="w-5 h-5 text-purple-600" /> :
                             <GraduationCap className="w-5 h-5 text-emerald-600" />}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-black text-slate-900 block">
                              {getRoleThaiName(roleName)}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              สถานะ: <span className="text-emerald-600 font-bold">เปิดใช้งานอยู่</span>
                            </span>
                          </div>
                        </div>

                        {isOriginalRole ? (
                          <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            สิทธิ์หลักเดิม (ไม่สามารถยกเลิกได้)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleInstantRevoke(roleName)}
                            disabled={isSubmitting}
                            title="ยกเลิกสิทธิ์นี้ทันที"
                            className="px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ยกเลิกสิทธิ์</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
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
