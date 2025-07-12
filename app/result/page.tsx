// /app/result/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ResultCard } from '@/components/ResultCard';
import { toPng } from 'html-to-image';

type Result = {
  type: string;
  summary: string;
  advice: string;
  quote: string;
  badge: string;
  rarity: string;
  tags: string[];
  percentile: number;
};

const rarityStyles: { [key: string]: string } = {
  "Common": "bg-gray-900",
  "Rare": "bg-gradient-to-br from-gray-900 to-blue-900/60",
  "Epic": "bg-gradient-to-br from-gray-900 to-purple-900/60",
  "Legendary": "bg-gradient-to-br from-gray-900 to-yellow-900/50",
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [showResult, setShowResult] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // [수정] API 요청 없이, sessionStorage에서 최종 결과 데이터를 가져옴
    const rawResult = sessionStorage.getItem('testResult');

    if (rawResult) {
      sessionStorage.removeItem('testResult'); // 사용 후 즉시 삭제
      try {
        const resultData = JSON.parse(rawResult);
        setResult(resultData);
        setTimeout(() => setShowResult(true), 100);
      } catch (e) {
        console.error("Failed to parse result data:", e);
        router.push('/');
      }
    } else {
      // 결과 데이터 없이 직접 접속한 경우, 홈으로 보냄
      router.push('/');
    }
  }, [router]);

  const handleImageShare = () => {
    if (!resultCardRef.current) return alert("결과 카드를 찾을 수 없습니다.");
    
    toPng(resultCardRef.current, { quality: 1.0, pixelRatio: 2 })
    .then((dataUrl) => {
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        const link = document.createElement('a');
        link.download = `내_멸망유형_${result?.type.replace(/\s/g, '_') || '결과'}-${timestamp}.png`;
        link.href = dataUrl;
        link.click();
    })
    .catch((err) => {
        console.error("html-to-image error:", err);
        alert("이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    });
  };

  if (!result) {
    // 페이지가 막 로드되었을 때 잠시 보이는 로딩 화면
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-green-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const rarityClass = rarityStyles[result.rarity] || "bg-gray-900";

  return (
    <main className={`min-h-screen p-6 flex items-center justify-center transition-colors duration-1000 ${rarityClass}`}>
      <div className={`max-w-xl w-full text-center transition-all duration-1000 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        
        <div ref={resultCardRef} className={`p-4 sm:p-8 rounded-2xl border-2 ${result.rarity === 'Legendary' ? 'border-glow-legendary-plus' : 'border-gray-700'} ${rarityClass}`}>
          <div className='bg-black/30 backdrop-blur-sm p-4 rounded-xl'>
            <ResultCard result={result} />
            <div className="mt-6 pt-4 border-t border-gray-600/50">
              <p className="text-sm font-bold text-gray-300">testgame.site</p>
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-lg font-semibold text-yellow-300 animate-pulse">
          당신은 멸망의 순간, 상위 {100 - result.percentile}%의 선택을 한 생존자입니다.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/test" className="w-full sm:w-auto inline-block bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all">
            다시 분석하기
          </a>
          <button 
            onClick={handleImageShare} 
            className="w-full sm:w-auto inline-block bg-green-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-600 transition-all">
            결과 이미지 다운로드
          </button>
        </div>
      </div>
    </main>
  );
}
