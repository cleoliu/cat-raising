import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "貓咪乾物質計算器",
  description: "幫助貓咪飼主計算貓糧乾物質含量的工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
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
      </body>
    </html>
  );
}
