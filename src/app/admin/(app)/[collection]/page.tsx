'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { AdminList } from '@/components/admin/AdminList';
import { COLLECTIONS } from '@/components/admin/config';

export default function AdminCollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = use(params);
  const config = COLLECTIONS[collection];
  if (!config) {
    notFound();
  }
  return <AdminList collection={config} />;
}
