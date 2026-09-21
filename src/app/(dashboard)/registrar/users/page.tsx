'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Search, Shield, CheckCircle, XCircle, ArrowLeft, UserPlus, Edit3, Mail, BookOpen, GraduationCap, ShieldCheck, UserCheck, RefreshCw, AlertCircle, Key, Info, Lock, CheckSquare, Square } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRouter, useSearchParams } from 'next/navigation';

const ALL_AVAILABLE_ROLES = [
  {
    name: 'STUDENT',
    title: '1. STUDENT - นักเรียน / นักศึกษา',
    description: 'สิทธิ์เข้าเรียนรายวิชา ส่งงาน รับชมสื่อ และเช็คชื่อเข้าเรียน',
    badgeVariant: 'success' as const,
  },
  {
    name: 'PROFESSOR',
    title: '2. PROFESSOR - อาจารย์ / ครูผู้สอน',
    description: 'สิทธิ์สร้างคอร์สเรียน จัดการบทเรียน ตรวจการบ้าน และเช็คชื่อนักเรียน',
    badgeVariant: 'bronze' as const,
  },
  {
    name: 'COURSE_CREATOR_APPROVER',
    title: '3. APPROVER - คนอนุมัติ / ผู้อนุมัติ (อนุมัติเปิดวิชาและอนุมัติสื่อการเรียนรู้)',
    description: 'สิทธิ์ในการตรวจสอบและพิจารณาอนุมัติหลักสูตร คอร์สเรียน และสื่อการสอนทั้งหมดประจำสถาบัน',
    badgeVariant: 'warning' as const,
  },
  {
    name: 'REGISTRAR',
    title: '4. REGISTRAR - นายทะเบียน / เจ้าหน้าที่ลงทะเบียน',
    description: 'สิทธิ์สูงสุดในการอนุมัติบัญชีผู้ใช้และกำหนดบทบาทบุคลากร',
    badgeVariant: 'luxury' as const,
  },
  {
    name: 'DIRECTOR',
    title: '5. DIRECTOR - ผู้อำนวยการ (Read-Only)',
    description: 'สิทธิ์ผู้บริหารดูภาพรวมสถาบันอย่างเดียว (Read-Only)',
    badgeVariant: 'danger' as const,
  },
];

function RegistrarUsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [totalMatching, setTotalMatching] = useState<number>(0);
  const [totalAllUsers, setTotalAllUsers] = useState<number>(0);
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});
  const [search, setSearch] = useState(initialSearch);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State (Multi-Role Assignment)
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editName, setEditName] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Role Requests Queue State
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null);
  const [requestFeedback, setRequestFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSelectedRoles, setNewSelectedRoles] = useState<string[]>(['PROFESSOR', 'STUDENT']);
  const [newDepartment, setNewDepartment] = useState('');
  const [newPassword, setNewPassword] = useState('xkarchang2026');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingUser || isAddModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingUser, isAddModalOpen]);

  const fetchUsers = () => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (selectedRoleFilter) query.set('role', selectedRoleFilter);
    query.set('limit', '100');

    fetch(`/api/registrar/users?${query.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        if (d.totalMatching !== undefined) setTotalMatching(d.totalMatching);
        if (d.totalAllUsers !== undefined) setTotalAllUsers(d.totalAllUsers);
        if (d.roleStats) setRoleStats(d.roleStats);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const deduplicateRequests = (requests: any[]) => {
    const seen = new Set<string>();
    return (requests || []).filter((req: any) => {
      const uId = req.userId || req.user?.id || req.user?.email || 'unknown';
      let rName = req.roleName;
      if (rName === 'APPROVER') rName = 'COURSE_CREATOR_APPROVER';
      const key = `${uId}_${rName}_${req.requestType || 'GRANT'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const fetchRoleRequests = () => {
    setIsLoadingRequests(true);
    fetch('/api/roles/request?all=true')
      .then((r) => r.json())
      .then((d) => {
        setRoleRequests(deduplicateRequests(d.requests || []));
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingRequests(false));
  };

  useEffect(() => {
    fetchUsers();
    fetchRoleRequests();
  }, [search, selectedRoleFilter]);

  const handleApproveRequest = async (reqId: string) => {
    // 1. Optimistically remove request immediately from view
    const targetReq = roleRequests.find((r) => r.id === reqId);
    setRoleRequests((prev) => prev.filter((r) => r.id !== reqId));
    setRequestFeedback({
      type: 'success',
      text: `อนุมัติคำขอสิทธิ์ ${targetReq?.roleName === 'COURSE_CREATOR_APPROVER' ? 'คนอนุมัติ (APPROVER)' : targetReq?.roleName || ''} ของ ${targetReq?.user?.name || 'ผู้ใช้'} สำเร็จแล้ว ระบบกำลังบันทึกลงฐานข้อมูล`,
    });

    setRequestActionLoading(reqId);
    try {
      const res = await fetch('/api/roles/request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqId,
          action: 'APPROVE',
          userId: targetReq?.userId || targetReq?.user?.id,
          userEmail: targetReq?.user?.email,
          roleName: targetReq?.roleName,
          reviewerEmail: 'registrar@x-karchang.ac.th',
          reviewNote: 'นายทะเบียนตรวจสอบคุณสมบัติและอนุมัติสิทธิ์เรียบร้อยแล้ว',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Rollback on failure
        if (targetReq) setRoleRequests((prev) => deduplicateRequests([targetReq, ...prev]));
        setRequestFeedback({ type: 'error', text: data.error || 'เกิดข้อผิดพลาดในการอนุมัติ' });
      } else {
        setRequestFeedback({
          type: 'success',
          text: `อนุมัติสิทธิ์ ${targetReq?.roleName === 'COURSE_CREATOR_APPROVER' ? 'คนอนุมัติ (APPROVER)' : targetReq?.roleName || ''} เรียบร้อยแล้ว ระบบปรับปรุงข้อมูลผู้ใช้ทันที`,
        });

        // Instant local sync for immediate UI role reflect without refresh
        if (targetReq?.user?.email && targetReq?.roleName) {
          const approvedEmail = targetReq.user.email;
          let roleToAdd = targetReq.roleName;
          if (roleToAdd === 'APPROVER') roleToAdd = 'COURSE_CREATOR_APPROVER';

          const storageKey = `approved_roles_${approvedEmail}`;
          try {
            const existing: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!existing.includes(roleToAdd)) {
              existing.push(roleToAdd);
              localStorage.setItem(storageKey, JSON.stringify(existing));
            }
          } catch {}

          try {
            const sessStr = localStorage.getItem('user_session');
            if (sessStr) {
              const sess = JSON.parse(sessStr);
              if (sess.email === approvedEmail) {
                const rList = Array.isArray(sess.roles) ? sess.roles : [];
                if (!rList.includes(roleToAdd)) {
                  rList.push(roleToAdd);
                  sess.roles = rList;
                  localStorage.setItem('user_session', JSON.stringify(sess));
                }
              }
            }
          } catch {}

          localStorage.setItem('role_last_updated', Date.now().toString());
          window.dispatchEvent(new CustomEvent('role_updated', {
            detail: { email: approvedEmail, role: roleToAdd }
          }));
        }

        fetchUsers();
        fetchRoleRequests();
      }
    } catch (e) {
      if (targetReq) setRoleRequests((prev) => deduplicateRequests([targetReq, ...prev]));
      setRequestFeedback({ type: 'error', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
    } finally {
      setRequestActionLoading(null);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    // 1. Optimistically remove request immediately from view
    const targetReq = roleRequests.find((r) => r.id === reqId);
    setRoleRequests((prev) => prev.filter((r) => r.id !== reqId));
    setRequestFeedback({ type: 'success', text: 'ปฏิเสธคำขอสิทธิ์เรียบร้อยแล้ว' });

    setRequestActionLoading(reqId);
    try {
      const res = await fetch('/api/roles/request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqId,
          action: 'REJECT',
          userId: targetReq?.userId || targetReq?.user?.id,
          userEmail: targetReq?.user?.email,
          roleName: targetReq?.roleName,
          reviewerEmail: 'registrar@x-karchang.ac.th',
          reviewNote: 'นายทะเบียนปฏิเสธคำขอ เนื่องจากไม่ผ่านเกณฑ์การประเมินสิทธิ์',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (targetReq) setRoleRequests((prev) => deduplicateRequests([targetReq, ...prev]));
        setRequestFeedback({ type: 'error', text: data.error || 'เกิดข้อผิดพลาดในการปฏิเสธ' });
      } else {
        fetchRoleRequests();
      }
    } catch (e) {
      if (targetReq) setRoleRequests((prev) => deduplicateRequests([targetReq, ...prev]));
      setRequestFeedback({ type: 'error', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
    } finally {
      setRequestActionLoading(null);
    }
  };

  const handleOpenEditModal = (u: any) => {
    setEditingUser(u);
    const currentRoles = u.userRoles?.map((ur: any) => ur.role?.name).filter(Boolean) || ['STUDENT'];
    setSelectedRoles(currentRoles);
    setEditName(u.name);
    setEditDepartment(u.department || '');
    setModalError(null);
    setModalSuccess(null);
  };

  const handleToggleRoleInEdit = (roleName: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        if (prev.length === 1) {
          // Keep at least 1 role
          return prev;
        }
        return prev.filter((r) => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleToggleRoleInAdd = (roleName: string) => {
    setNewSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (selectedRoles.length === 0) {
      setModalError('กรุณาเลือกอย่างน้อย 1 บทบาทสำหรับผู้ใช้งานนี้');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const res = await fetch('/api/registrar/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: editingUser.id,
          roleNames: selectedRoles,
          newName: editName,
          department: editDepartment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || 'เกิดข้อผิดพลาดในการอัปเดตสิทธิ์');
        return;
      }

      setModalSuccess(`อัปเดตสิทธิ์ผู้ใช้งานสำเร็จ! สิทธิ์ปัจจุบัน: ${selectedRoles.join(', ')}`);
      setTimeout(() => {
        setEditingUser(null);
        fetchUsers();
      }, 1000);
    } catch (err: any) {
      setModalError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await fetch('/api/registrar/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUserId: userId,
        status: newStatus,
      }),
    });
    fetchUsers();
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch('/api/registrar/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          roleNames: newSelectedRoles,
          department: newDepartment,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || 'เกิดข้อผิดพลาดในการสร้างบัญชี');
        return;
      }

      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewDepartment('');
      setNewPassword('xkarchang2026');
      fetchUsers();
    } catch (err: any) {
      setModalError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'REGISTRAR': return 'luxury' as const;
      case 'PROFESSOR': return 'bronze' as const;
      case 'COURSE_CREATOR_APPROVER': return 'warning' as const;
      case 'CONTENT_APPROVER': return 'info' as const;
      case 'DIRECTOR': return 'danger' as const;
      case 'STUDENT': default: return 'success' as const;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-900 pb-16">
      
      {/* Page Header */}
      <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/registrar')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-black" />
              <span>ลงทะเบียน</span>
            </h1>
          </div>
        </div>

      {/* Role Requests Notification Feedback */}
      {requestFeedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-fadeIn ${
          requestFeedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{requestFeedback.text}</span>
          </div>
          <button onClick={() => setRequestFeedback(null)} className="text-slate-500 hover:text-black">✕</button>
        </div>
      )}

      {/* Section: Role Permission Requests Queue — always visible at top */}
      <Card className="border-amber-300 bg-amber-50/50 shadow-md overflow-hidden animate-fadeIn">
        <CardHeader className="bg-amber-100/70 border-b border-amber-200 p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-amber-950">
                กล่องคำขอสิทธิ์
              </h2>
              <p className="text-xs text-amber-800 font-medium">
                {roleRequests.filter((r) => r.status === 'PENDING').length > 0 ? (
                  <>มีคำขอรอดำเนินการ{' '}
                    <span className="font-extrabold text-amber-950 underline">
                      {roleRequests.filter((r) => r.status === 'PENDING').length} รายการ
                    </span>
                  </>
                ) : 'ไม่มีคำขอไว้รอดำเนินการ'}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchRoleRequests}
            className="text-xs font-bold bg-white text-slate-800 border-amber-300"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            รีเฟรช
          </Button>
        </CardHeader>

        <div className="divide-y divide-amber-200/60 p-2 sm:p-4 space-y-3">
          {roleRequests.filter((r) => r.status === 'PENDING').length === 0 ? (
            <p className="text-center text-xs text-amber-700 py-4">ไม่มีคำขอสิทธิ์ใหม่ในขณะนี้</p>
          ) : (
            roleRequests
              .filter((r) => r.status === 'PENDING')
              .map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {req.user?.name || 'ผู้ใช้งาน'}
                      </span>
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {req.user?.email}
                      </span>
                      <Badge
                        variant={req.requestType === 'GRANT' ? 'warning' : 'danger'}
                        size="sm"
                        className="font-black text-[10px]"
                      >
                        {req.requestType === 'GRANT' ? '➕ ขอรับสิทธิ์ใหม่' : '➖ ขอยกเลิกสิทธิ์'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-700 flex flex-wrap items-center gap-2">
                      <span>ต้องการ:</span>
                      <span className="font-extrabold text-slate-900 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        {req.roleName === 'COURSE_CREATOR_APPROVER' ? 'คนอนุมัติ (APPROVER)' : req.roleName}
                      </span>
                      {req.reason && (
                        <span className="text-slate-600 italic">— เหตุผล: "{req.reason}"</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ยื่นคำขอเมื่อ: {new Date(req.createdAt).toLocaleString('th-TH')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.user && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEditModal(req.user)}
                        className="text-xs font-bold bg-white text-slate-800 border-amber-300 hover:bg-amber-50"
                        leftIcon={<Info className="w-3.5 h-3.5 text-amber-600" />}
                      >
                        ดูข้อมูลผู้ใช้
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={requestActionLoading === req.id}
                      onClick={() => handleApproveRequest(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs"
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                    >
                      อนุมัติ
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={requestActionLoading === req.id}
                      onClick={() => handleRejectRequest(req.id)}
                      className="text-xs font-bold"
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      ปฏิเสธ
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedRoleFilter('')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            selectedRoleFilter === ''
              ? 'bg-black text-[#CEF34B] shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          ทั้งหมด ({totalAllUsers > 0 ? totalAllUsers.toLocaleString() : users.length})
        </button>
        <button
          onClick={() => setSelectedRoleFilter('STUDENT')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            selectedRoleFilter === 'STUDENT'
              ? 'bg-black text-[#CEF34B] shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          นักเรียน / นักศึกษา (STUDENT) ({roleStats['STUDENT'] !== undefined ? roleStats['STUDENT'].toLocaleString() : '-'})
        </button>
        <button
          onClick={() => setSelectedRoleFilter('PROFESSOR')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            selectedRoleFilter === 'PROFESSOR'
              ? 'bg-black text-[#CEF34B] shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          อาจารย์ / ครู (PROFESSOR) ({roleStats['PROFESSOR'] !== undefined ? roleStats['PROFESSOR'].toLocaleString() : '-'})
        </button>
        <button
          onClick={() => setSelectedRoleFilter('COURSE_CREATOR_APPROVER')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            selectedRoleFilter === 'COURSE_CREATOR_APPROVER' || selectedRoleFilter === 'APPROVER'
              ? 'bg-black text-[#CEF34B] shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          ผู้อนุมัติรายวิชา (APPROVER) ({(roleStats['COURSE_CREATOR_APPROVER'] || roleStats['APPROVER'] || 0).toLocaleString()})
        </button>
        <button
          onClick={() => setSelectedRoleFilter('REGISTRAR')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            selectedRoleFilter === 'REGISTRAR'
              ? 'bg-black text-[#CEF34B] shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          นายทะเบียน (REGISTRAR) ({roleStats['REGISTRAR'] !== undefined ? roleStats['REGISTRAR'].toLocaleString() : '-'})
        </button>
      </div>

      {/* Main Users Table Card */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="ค้นหาชื่อ, อีเมล หรือสังกัด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            พบผู้ใช้งานในระบบจำนวน <span className="font-bold text-slate-900">{totalMatching > 0 ? totalMatching.toLocaleString() : users.length}</span> รายการ
            {totalMatching > users.length && <span className="text-slate-400 font-normal"> (แสดง {users.length} รายการล่าสุด)</span>}
          </p>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-xs">
                <th className="p-4 pl-6">ชื่อ-นามสกุล</th>
                <th className="p-4">อีเมลสถาบัน</th>
                <th className="p-4">สังกัด / แผนก</th>
                <th className="p-4">บทบาททั้งหมด (Roles)</th>
                <th className="p-4">สถานะบัญชี</th>
                <th className="p-4 pr-6 text-right">การจัดการมอบสิทธิ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    {isLoading ? 'กำลังโหลดข้อมูลผู้ใช้...' : 'ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่ค้นหา'}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const userRolesList = u.userRoles?.map((ur: any) => ur.role?.name).filter(Boolean) || ['STUDENT'];
                  return (
                    <tr
                      key={u.id}
                      onClick={() => handleOpenEditModal(u)}
                      className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                      title="คลิกเพื่อดูข้อมูลและจัดการสิทธิ์"
                    >
                      <td className="p-4 pl-6 font-bold text-slate-900 text-sm sm:text-base group-hover:text-amber-800">
                        {u.name}
                      </td>
                      <td className="p-4 font-mono text-slate-700 text-xs sm:text-sm">{u.email}</td>
                      <td className="p-4 text-slate-600 text-xs sm:text-sm">{u.department || u.studentId || '-'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {userRolesList.map((rName: string) => (
                            <Badge
                              key={rName}
                              variant={getRoleBadgeVariant(rName)}
                              size="sm"
                              className="font-bold text-xs"
                            >
                              {rName}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm" className="font-bold text-xs">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(u);
                          }}
                          className="text-xs font-extrabold border-black bg-black text-[#CEF34B] hover:bg-slate-800"
                          leftIcon={<ShieldCheck className="w-4 h-4 text-[#CEF34B]" />}
                        >
                          คลิกดูข้อมูล / มอบสิทธิ์
                        </Button>

                        {u.status === 'ACTIVE' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(u.id, u.status);
                            }}
                            className="text-xs font-bold"
                          >
                            ระงับสิทธิ์
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(u.id, u.status);
                            }}
                            className="text-xs font-extrabold bg-[#CEF34B] text-black"
                          >
                            เปิดใช้งาน
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Multi-Role Assignment Modal (Fullscreen z-[99999] Backdrop Overlay covering 100% of Viewport) */}
      {mounted && editingUser && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-black" />
                <span>เพิ่ม/จัดการสิทธิ์หลายบทบาท (Multi-Role Assignment)</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-black text-[#CEF34B] text-xs sm:text-sm flex items-center gap-2 font-bold">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#CEF34B]" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-5 text-xs sm:text-sm">
              {/* User Full Profile Info & Current Role Badges */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ข้อมูลผู้ใช้งาน (User Profile)</p>
                    <p className="font-extrabold text-slate-900 text-lg">{editingUser.name}</p>
                    <p className="font-mono text-slate-600 text-xs mt-0.5">{editingUser.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 items-center sm:justify-end">
                    <Badge variant={editingUser.status === 'ACTIVE' ? 'success' : 'danger'} size="sm" className="font-bold">
                      สถานะ: {editingUser.status || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">รหัสประจำตัว</span>
                    <span className="font-semibold text-slate-800">{editingUser.studentId || editingUser.id?.slice(0, 8) || '-'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">แผนก / สังกัด</span>
                    <span className="font-semibold text-slate-800">{editingUser.department || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px]">วันที่ลงทะเบียน</span>
                    <span className="font-semibold text-slate-800">
                      {editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleDateString('th-TH') : '-'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-1">สิทธิ์ปัจจุบันที่ถือครอง:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRoles.map((r) => (
                      <Badge key={r} variant={getRoleBadgeVariant(r)} size="sm">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-Role Checkboxes Instruction */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>เลือกระบุบทบาทที่ต้องการมอบให้ถือครอง (ติ๊กเลือกเพิ่มได้หลายบทบาท):</span>
                  <span className="text-xs text-black font-extrabold bg-[#CEF34B] px-2 py-0.5 rounded-full">เลือกแล้ว {selectedRoles.length} สิทธิ์</span>
                </label>

                <p className="text-xs text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  💡 <strong>ข้อแนะนำสำหรับนายทะเบียน:</strong> ท่านสามารถติ๊กเลือกมอบสิทธิ์เพิ่มให้ผู้ใช้งานถือครองหลายบทบาทพร้อมกันได้โดยไม่ต้องลบสิทธิ์เดิม (เช่น อาจารย์ถือสิทธิ์ <code>PROFESSOR</code> + <code>STUDENT</code> หรือ คนอนุมัติถือสิทธิ์ <code>COURSE_CREATOR_APPROVER</code> + <code>STUDENT</code>)
                </p>

                {/* Checkboxes Grid */}
                <div className="space-y-2.5 pt-1">
                  {ALL_AVAILABLE_ROLES.map((roleObj) => {
                    const isChecked = selectedRoles.includes(roleObj.name);

                    return (
                      <div
                        key={roleObj.name}
                        onClick={() => handleToggleRoleInEdit(roleObj.name)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-black border-black text-white shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-[#CEF34B]" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-sm ${isChecked ? 'text-white' : 'text-slate-900'}`}>{roleObj.title}</span>
                            <Badge variant={roleObj.badgeVariant} size="sm">
                              {roleObj.name}
                            </Badge>
                          </div>
                          <p className={`text-xs mt-1 leading-normal ${isChecked ? 'text-slate-300' : 'text-slate-500'}`}>
                            {roleObj.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">แผนก / สังกัด</label>
                <Input
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="เช่น ภาควิชาวิศวกรรมคอมพิวเตอร์"
                  className="bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setEditingUser(null)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold px-6 shadow-sm"
                >
                  บันทึกการมอบสิทธิ์เพิ่ม
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add New Staff/User Modal (Fullscreen z-[99999] Backdrop Overlay covering 100% of Viewport) */}
      {mounted && isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-black" />
                <span>เพิ่มบุคลากร / ครูใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewUser} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                <Input
                  required
                  placeholder="เช่น ดร.สมศักดิ์ สายวิชา"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">อีเมลสถาบันประจำสิทธิ์</label>
                <Input
                  type="email"
                  required
                  placeholder="teacher.new@x-karchang.ac.th"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 font-mono text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">กำหนดบทบาทตั้งต้น (เลือกมอบได้หลายสิทธิ์):</label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {ALL_AVAILABLE_ROLES.map((roleObj) => {
                    const isChecked = newSelectedRoles.includes(roleObj.name);
                    return (
                      <div
                        key={roleObj.name}
                        onClick={() => handleToggleRoleInAdd(roleObj.name)}
                        className={`p-2.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between ${
                          isChecked ? 'bg-black text-[#CEF34B] border-black font-extrabold' : 'bg-white border-slate-200 text-slate-700 font-medium'
                        }`}
                      >
                        <span>{roleObj.title}</span>
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#CEF34B]" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รหัสผ่านสำหรับเข้าสู่ระบบ</label>
                <Input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-50 border-slate-200 font-mono text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ภาควิชา / สังกัด</label>
                <Input
                  placeholder="เช่น สาขาช่างกลโรงงาน"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="bg-[#CEF34B] hover:bg-[#bce038] text-black font-extrabold px-6 shadow-sm"
                >
                  บันทึกการสร้างบัญชี
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function RegistrarUsersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูลผู้ใช้...</div>}>
      <RegistrarUsersContent />
    </React.Suspense>
  );
}

