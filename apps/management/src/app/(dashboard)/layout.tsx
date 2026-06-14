"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { useSocketStore } from "@/stores/socket.store";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    connect();
    return () => disconnect();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}