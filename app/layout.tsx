// app/layout.tsx
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { localizedMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ 다국어 메시지 로드 함수
async function getMessages(locale: string) {
  try {
    return (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.warn(`[i18n] Failed to load messages for locale "${locale}", falling back to "en"`);
    return (await import(`../messages/en.json`)).default;
  }
}

// ✅ locale에 따라 동적 메타데이터 반환
export async function generateMetadata() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  const meta = localizedMetadata[locale as keyof typeof localizedMetadata] ?? localizedMetadata['en'];

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: "https://testgame.site",
      locale: locale,
      siteName: meta.siteName,
      type: "website",
    },
    twitter: {
      title: meta.title,
      description: meta.description,
      card: "summary_large_image",
    },
  };
}

// ✅ 레이아웃
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
