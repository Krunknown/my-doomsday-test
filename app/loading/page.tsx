// /app/loading/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

const loadingMessages = [
  "당신의 뇌파와 AI 동기화 중... (오류율: 42%)",
  "선택지에 숨겨진 무의식의 '찌질함'을 분석합니다.",
  "과거의 트라우마가 멸망에 미친 영향을 역산 중...",
  "AI가 당신의 성향을 비웃을 확률: 82%... 계산 완료.",
  "인류 데이터베이스에서 당신과 유사한 '관종' 유형 검색 중...",
  "최종 생존 프로파일링 완료. 곧 결과를 전송합니다."
];

const ScannerAnimation = () => (
  <div className="relative w-48 h-48">
    <div className="absolute inset-0 border-2 border-green-500/30 rounded-full animate-spin" style={{ animationDuration: '5s' }}></div>
    <div className="absolute inset-2 border border-green-500/20 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
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

// [운영용] 실제 애드센스 광고 컴포넌트
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

// [개발용] 테스트를 위한 가짜 광고 컴포넌트
const FakeAdsenseAd = () => {
  return (
    <div className="w-[300px] h-[250px] bg-gray-700 flex items-center justify-center text-center text-white/50 p-4">
      <p>광고 테스트 영역<br/>(300x250)</p>
    </div>
  );
};


export default function LoadingPage() {
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState("AI 코어에 접속하는 중...");
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
      body: JSON.stringify({ history: parsed })
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
        console.error("Failed to generate result:", err);
        alert("결과 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        router.push('/'); 
      })
      .finally(() => {
        clearInterval(messageInterval);
      });

    return () => clearInterval(messageInterval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black text-white overflow-hidden">
      {/* [수정] 운영 환경에서만 애드센스 스크립트를 로드 */}
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
        <p className="text-sm text-gray-500">AI가 당신의 영혼을 분석하는 동안 잠시 광고를 시청하세요.</p>
        <div className="w-[300px] h-[250px] bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-center backdrop-blur-sm overflow-hidden">
          {/* [수정] 개발 환경에서는 가짜 광고를, 운영 환경에서는 진짜 광고를 렌더링 */}
          {process.env.NODE_ENV === 'production' ? <AdsenseAd /> : <FakeAdsenseAd />}
        </div>
      </div>
    </div>
  );
}
