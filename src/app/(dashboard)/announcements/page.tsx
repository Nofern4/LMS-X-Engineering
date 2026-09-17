'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnnouncementsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student');
  }, [router]);

  return null;
}
