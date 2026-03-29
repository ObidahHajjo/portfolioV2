import type { Metadata } from 'next';

import AdminShell from '@/components/admin/AdminShell';
import { SessionWarning } from '@/components/admin/SessionWarning';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Admin Portal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <SessionWarning />
      {children}
      <Toaster position="top-right" />
    </AdminShell>
  );
}
