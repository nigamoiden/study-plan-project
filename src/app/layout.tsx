import "./globals.css";

import { AuthProvider } from "@/components/auth/AuthProvider";
import AppNavigation from "@/components/navigation/AppNavigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minh Nhật Béo | Lộ trình học tập của bạn",
  description:
    "Thiết lập mục tiêu, xây dựng lộ trình học tập cá nhân và theo dõi tiến độ mỗi ngày.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <AppNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}