'use client';

import React, { useEffect, useState } from 'react';
import StudentDashboard from './student/page';
import ProfessorDashboard from './professor/page';
import CourseApproverDashboard from './course-approver/page';
import DirectorDashboard from './director/page';
import RegistrarDashboard from './registrar/page';
import { Skeleton } from '@/components/ui/Skeleton';

export default function RootDashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const demoEmail = localStorage.getItem('demo_user_email') || 'student@student.x-karchang.ac.th';
    if (demoEmail.includes('registrar')) setRole('REGISTRAR');
    else if (demoEmail.includes('director')) setRole('DIRECTOR');
    else if (demoEmail.includes('prof')) setRole('PROFESSOR');
    else if (demoEmail.includes('approver')) setRole('APPROVER');
    else setRole('STUDENT');
  }, []);

  if (!role) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  switch (role) {
    case 'REGISTRAR':
      return <RegistrarDashboard />;
    case 'PROFESSOR':
      return <ProfessorDashboard />;
    case 'APPROVER':
    case 'COURSE_CREATOR_APPROVER':
    case 'CONTENT_APPROVER':
      return <CourseApproverDashboard />;
    case 'DIRECTOR':
      return <DirectorDashboard />;
    case 'STUDENT':
    default:
      return <StudentDashboard />;
  }
}
