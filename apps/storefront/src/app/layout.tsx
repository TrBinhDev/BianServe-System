import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BianServe — Đặt món',
  description: 'Scan QR để đặt món tại bàn',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${geist.variable} antialiased bg-[#0F0F0F] text-white`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}