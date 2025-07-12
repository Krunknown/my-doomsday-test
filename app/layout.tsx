import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "지구 멸망 1분 전 테스트 | AI가 분석하는 당신의 생존 본능",
  description: "지구 멸망 직전, 당신의 진짜 본성은? AI가 황당하고 웃긴 질문들로 당신의 숨겨진 성향과 관계 심리를 분석해 드립니다. 당신의 생존 유형을 확인해보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
