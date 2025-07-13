import { NextResponse, type NextRequest } from 'next/server';
import Negotiator from 'negotiator';
import { match } from '@formatjs/intl-localematcher';

const supportedLocales = [
  'en', 'ko', 'es', 'ja', 'de', 'fr', 'pt', 'ru', 'zh', 'it',
  'ar', 'hi', 'id', 'tr', 'vi', 'pl', 'nl', 'th', 'sv', 'ms'
] as const;

const defaultLocale = 'en';

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get('locale')?.value;
  if (cookie && supportedLocales.includes(cookie as any)) return cookie;

  // 헤더에서 브라우저 선호 언어 추출
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => (headers[k] = v));
  const languages = new Negotiator({ headers }).languages();

  // regional variant 포함한 언어 목록 → best match
  const matched = match(languages, supportedLocales, defaultLocale);
  return matched;
}

export function middleware(request: NextRequest) {
  const locale = detectLocale(request);

  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);

  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  response.cookies.set('locale', locale, { path: '/' });

  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
