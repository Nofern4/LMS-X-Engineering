'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, HardDrive, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function AdminSystemPage() {
  const router = useRouter();
  const [allowedDomains, setAllowedDomains] = useState('@student.institution.ac.th,@institution.ac.th');
  const [storageLimitGb, setStorageLimitGb] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/system')
      .then((r) => r.json())
      .then((d) => {
        const domains = d.settings?.find((s: any) => s.key === 'ALLOWED_EMAIL_DOMAINS');
        const storage = d.settings?.find((s: any) => s.key === 'COURSE_STORAGE_LIMIT_GB');
        if (domains) setAllowedDomains(domains.value);
        if (storage) setStorageLimitGb(storage.value);
      });
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'admin-1', key: 'ALLOWED_EMAIL_DOMAINS', value: allowedDomains }),
      });

      await fetch('/api/admin/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'admin-1', key: 'COURSE_STORAGE_LIMIT_GB', value: storageLimitGb }),
      });

      setMessage('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    } catch (e) {
      setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">กำหนดค่าระบบ (System Configurations)</h1>
          <p className="text-xs text-slate-500">กำหนดโดเมนอีเมลของสถาบันที่อนุญาต และจำกัดขนาดพื้นที่จัดเก็บต่อรายวิชา</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">นโยบายความปลอดภัยและโควต้าพื้นที่</h3>
        </CardHeader>

        <CardBody className="space-y-6">
          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              โดเมนอีเมลสถาบันที่อนุญาต (ALLOWED_EMAIL_DOMAINS)
            </label>
            <Input
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              leftIcon={<Shield className="w-4 h-4 text-brand-600" />}
              helperText="คั่นแต่ละโดเมนด้วยเครื่องหมายจุลภาค (Comma) เช่น @student.institution.ac.th,@institution.ac.th"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              ขนาดพื้นที่จัดเก็บตั้งต้นต่อรายวิชา (COURSE_STORAGE_LIMIT_GB)
            </label>
            <Input
              type="number"
              value={storageLimitGb}
              onChange={(e) => setStorageLimitGb(e.target.value)}
              leftIcon={<HardDrive className="w-4 h-4 text-brand-600" />}
              helperText="หน่วยเป็น Gigabytes (GB) อาจารย์จะไม่สามารถอัปโหลดสื่อเกินโควต้านี้ได้"
            />
          </div>
        </CardBody>

        <CardFooter className="flex justify-end">
          <Button
            variant="primary"
            isLoading={isLoading}
            onClick={handleSaveSettings}
            leftIcon={<Save className="w-4 h-4" />}
          >
            บันทึกการตั้งค่า
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
