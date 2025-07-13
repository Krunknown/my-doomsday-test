// /app/loading/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl'; // [추가]

// [삭제] 기존의 하드코딩된 메시지 배열

const ScannerAnimation = () => (
  <div className="relative w-48 h-48">
    <div className="absolute inset-0 border-2 border-green-500/30 rounded-full animate-spin" style={{ animationDuration: '5s' }}></div>
    <div className="absolute inset-2 border-green-500/20 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-24 h-24 text-green-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="absolute inset-0 overflow-hidden rounded-full">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-green-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
      <div className="absolute w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] top-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
    </div>
  </div>
);

const AdsenseAd = () => {
  const adPushed = useRef(false);

  useEffect(() => {
    if (!adPushed.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch (err) {
        console.error("Adsense push error:", err);
      }
    }
  }, []);

  return (
    <ins className="adsbygoogle"
      style={{ display: 'inline-block', width: '300px', height: '250px' }}
      data-ad-client="ca-pub-8827080947099772"
      data-ad-slot="7075534419"></ins>
  );
};

const FakeAdsenseAd = () => {
  return (
    <div className="w-[300px] h-[250px] bg-gray-700 flex items-center justify-center text-center text-white/50 p-4">
      <p>광고 테스트 영역<br/>(300x250)</p>
    </div>
  );
};

export default function LoadingPage() {
  const t = useTranslations('LoadingPage'); // [추가]
  const router = useRouter();
  const locale = useLocale();
  // [수정] t.raw를 사용하여 메시지 배열을 가져오고, t()를 사용하여 초기 메시지 설정
  const loadingMessages = t.raw('messages') as string[];
  const [loadingMessage, setLoadingMessage] = useState(t('initial_message'));
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const rawHistory = sessionStorage.getItem('testHistory');
    if (!rawHistory) {
      router.push('/');
      return;
    }
    
    sessionStorage.removeItem('testHistory');

    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingMessage(loadingMessages[randomIndex]);
    }, 2000);

    const parsed = JSON.parse(rawHistory);
    
    const apiRequest = fetch('/api/generate-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: parsed, locale })
    }).then(res => {
      if (!res.ok) return Promise.reject(new Error(`서버 오류 (${res.status})`));
      return res.json();
    });

    const minWait = new Promise(resolve => setTimeout(resolve, 7000));

    Promise.all([apiRequest, minWait])
      .then(([data]) => {
        sessionStorage.setItem('testResult', JSON.stringify(data));
        router.push('/result');
      })
      .catch(err => {
        alert(t('alert_analysis_error')); // [수정]
        router.push('/'); 
      })
      .finally(() => {
        clearInterval(messageInterval);
      });

    return () => clearInterval(messageInterval);
  }, [router, t, loadingMessages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black text-white overflow-hidden">
      {process.env.NODE_ENV === 'production' && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8827080947099772"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.3),rgba(255,255,255,0))] opacity-40"></div>

      <ScannerAnimation />
      
      <p className="text-2xl font-bold mt-8 font-mono animate-pulse">{loadingMessage}</p>
      
      <div className="mt-8 flex flex-col items-center w-full space-y-2">
        {/* [수정] 하드코딩된 텍스트를 t() 함수로 변경 */}
        <p className="text-sm text-gray-500">{t('ad_notice')}</p>
        <div className="w-[300px] h-[250px] bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-center backdrop-blur-sm overflow-hidden">
          {process.env.NODE_ENV === 'production' ? <AdsenseAd /> : <FakeAdsenseAd />}
        </div>
      </div>
    </div>
  );
}
