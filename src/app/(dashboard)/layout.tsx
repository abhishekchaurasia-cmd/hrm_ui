'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    if (
      (pathname.startsWith('/dashboard/hr') ||
        pathname.startsWith('/dashboard/admin') ||
        pathname.startsWith('/settings')) &&
      session.user.role !== 'hr'
    ) {
      router.replace('/dashboard');
    }
  }, [pathname, router, session]);

  if (status === 'loading') {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
