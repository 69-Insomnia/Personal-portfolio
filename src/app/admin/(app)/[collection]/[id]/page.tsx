'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { AdminForm } from '@/components/admin/AdminForm';
import { COLLECTIONS } from '@/components/admin/config';

export default function AdminItemPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: collectionKey, id } = use(params);
  const config = COLLECTIONS[collectionKey];
  if (!config) {
    notFound();
  }
  const decoded = id === 'new' ? null : decodeURIComponent(id);
  return <AdminForm collection={config} id={decoded} />;
}
