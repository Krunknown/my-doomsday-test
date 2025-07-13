// /app/result/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ResultCard } from '@/components/ResultCard';
import { toPng } from 'html-to-image';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ResultPage');
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [showResult, setShowResult] = useState(false);
  // [추가] 버튼 클릭 처리 중인지 여부를 나타내는 상태
  const [isProcessingClick, setIsProcessingClick] = useState(false);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const rawResult = sessionStorage.getItem('testResult');

    if (rawResult) {
      sessionStorage.removeItem('testResult');
      try {
        const resultData = JSON.parse(rawResult);
        setResult(resultData);
        setTimeout(() => setShowResult(true), 1500);
      } catch (e) {
        console.error("Failed to parse result data:", e);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleRetryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // [추가] 이미 처리 중이면 함수 실행 중단
    if (isProcessingClick) {
      e.preventDefault(); // 기본 내비게이션 방지
      return;
    }
    // [추가] 클릭 처리 중 상태로 설정
    setIsProcessingClick(true);
    // 내비게이션은 Next.js의 Link 컴포넌트나 router.push를 통해 이루어지므로,
    // 여기서 직접적인 동작은 필요 없음.
    // 만약 router.push를 사용한다면 아래와 같이 쓸 수 있습니다.
    // setTimeout(() => { router.push('/test'); }, 100); // 약간의 딜레이
  };

  const handleImageShare = () => {
    // [추가] 이미 처리 중이면 함수 실행 중단
    if (isProcessingClick) {
      return;
    }
    // [추가] 클릭 처리 중 상태로 설정
    setIsProcessingClick(true);

    if (!resultCardRef.current) {
      alert(t('alert_card_not_found'));
      setIsProcessingClick(false); // 오류 발생 시 상태 초기화
      return;
    }

    toPng(resultCardRef.current, { quality: 1.0, pixelRatio: 2 })
      .then((dataUrl) => {
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
        const link = document.createElement('a');
        link.download = `내_멸망유형_${result?.type.replace(/\s/g, '_') || '결과'}-${timestamp}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("html-to-image error:", err);
        alert(t('alert_image_error'));
      })
      .finally(() => {
        // [추가] 이미지 다운로드 처리 완료 후 상태 초기화 (성공/실패 무관)
        setIsProcessingClick(false);
      });
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-green-500 animate-spin"></div>
        </div>
        <p className="text-2xl font-bold mt-8">{t('loading_text')}</p>
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
              <p className="text-sm font-bold text-gray-300">{t('site_url')}</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-lg font-semibold text-yellow-300 animate-pulse">
          {t('percentile_text', { percentile: 100 - result.percentile })}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/test"
            onClick={handleRetryClick}
            // [수정] isProcessingClick 상태에 따라 비활성화 및 스타일 변경
            className={`w-full sm:w-auto inline-block px-8 py-3 rounded-lg font-bold transition-all
                        ${isProcessingClick
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200'
              }`}
            aria-disabled={isProcessingClick} // 접근성을 위한 속성
          >
            {t('button_retry')}
          </a>
          <button
            onClick={handleImageShare}
            // [수정] isProcessingClick 상태에 따라 비활성화 및 스타일 변경
            className={`w-full sm:w-auto inline-block px-8 py-3 rounded-lg font-bold transition-all
                        ${isProcessingClick
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            disabled={isProcessingClick} // HTML button의 disabled 속성 사용
          >
            {t('button_download_image')}
          </button>
        </div>
      </div>
    </main>
  );
}