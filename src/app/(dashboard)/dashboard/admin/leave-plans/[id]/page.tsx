'use client';

import { useParams } from 'next/navigation';

import { LeavePlanDetailScreen } from '@/features/admin/leave-plans';

export default function LeavePlanDetailPage() {
  const params = useParams<{ id: string }>();
  return <LeavePlanDetailScreen planId={params.id} />;
}
