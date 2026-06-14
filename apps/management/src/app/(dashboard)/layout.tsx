'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useSocketStore } from '@/stores/socket.store';
import Sidebar from '@/components/shared/sidebar';
import Header from '@/components/shared/header';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { connect, disconnect, socket } = useSocketStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    connect();
    return () => disconnect();
  }, [isAuthenticated]);

  // Lắng nghe account_locked
  useEffect(() => {
    if (!socket || !user) return;

    const handleAccountLocked = ({ userId }: { userId: string }) => {
      if (userId === user.id) {
        toast.error('Tài khoản của bạn đã bị khóa', { duration: 5000 });
        clearAuth();
        router.push('/login');
      }
    };

    socket.on('account_locked', handleAccountLocked);
    return () => {
      socket.off('account_locked', handleAccountLocked);
    };
  }, [socket, user]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
