import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLayout } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthGuard } from "@/components/auth-guard";
import { AuthProvider } from "@/components/auth-provider";
import { FloatingChat } from "@/components/floating-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saku - Academic Dashboard",
  description:
    "Manage your academic tasks, schedule, and study groups with Saku",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <SidebarProvider defaultOpen={true}>
            <AuthGuard>
              <SidebarLayout>{children}</SidebarLayout>
            </AuthGuard>
          </SidebarProvider>
          <Toaster richColors position="top-right" />
          <FloatingChat />
        </AuthProvider>
      </body>
    </html>
  );
}
