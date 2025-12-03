import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import VersionManager from "@/components/VersionManager";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Cat-Raising - 全方位貓咪生活管理平台",
  description: "一站式貓咪生活管理應用程式：營養計算、飲食記錄、日常筆記、提醒任務、醫療保健、記帳花費、消耗品庫存管理及每月報表分析",
  keywords: "貓咪管理, 寵物app, 營養計算, AAFCO, 貓糧分析, 寵物健康, 飲食記錄, 醫療保健, 寵物記帳, 庫存管理, 提醒功能, 寵物日記",
  authors: [{ name: "Cat-Raising Team" }],
  creator: "Cat-Raising Team",
  publisher: "Cat-Raising Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cat-Raising",
  },
  openGraph: {
    title: "Cat-Raising - 全方位貓咪生活管理平台",
    description: "一站式貓咪生活管理應用程式：營養分析、健康記錄、智能提醒、支出管理",
    type: "website",
    locale: "zh_TW",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="background-color" content="#ffffff" />
        
        {/* iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cat-Raising" />
        
        {/* iOS Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <div className="fixed top-0 left-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30"></div>
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 blur-3xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] animate-pulse-slow rounded-full bg-gradient-to-r from-accent/25 to-secondary/25 blur-3xl" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        </div>
        {children}
        <PWAInstallPrompt />
        <VersionManager />
      </body>
    </html>
  );
}
