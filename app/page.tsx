// /app/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const [soundEnabled, setSoundEnabled] = useState(false);
  // [추가] 시작 버튼이 눌렸는지 추적하는 상태
  const [isStarting, setIsStarting] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const handleEnter = () => {
    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio('/ambient-noise.mp3');
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.5;
    }

    ambientAudioRef.current.play().catch(error => console.error("배경음악 재생 실패:", error));

    setSoundEnabled(true);
  };

  const handleStartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // [수정] 이미 시작 중이면 함수 실행을 중단합니다.
    if (isStarting) {
      return;
    }

    // [추가] 시작 상태로 설정하여 중복 클릭 방지
    setIsStarting(true);

    const clickSound = new Audio('/click.mp3');
    clickSound.volume = 0.7;
    clickSound.play();

    if (ambientAudioRef.current) {
      let volume = ambientAudioRef.current.volume;
      const fadeOutInterval = setInterval(() => {
        volume -= 0.05;
        if (volume > 0) {
          ambientAudioRef.current!.volume = volume;
        } else {
          ambientAudioRef.current!.pause();
          clearInterval(fadeOutInterval);
        }
      }, 30);
    }

    setTimeout(() => {
      router.push('/test');
    }, 300);
  };

  useEffect(() => {
    return () => {
      ambientAudioRef.current?.pause();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {!soundEnabled ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white/80 mb-8 animate-pulse">
            {t('initial_title')}
          </h1>
          <button
            onClick={handleEnter}
            className="text-2xl font-bold bg-white text-black px-10 py-4 rounded-md border-2 border-gray-300
                        hover:bg-gray-200 hover:scale-105 active:scale-100
                        transition-all duration-300"
          >
            {t('activate_button')}
          </button>
        </div>
      ) : (
        <>
          <main className="relative flex-grow flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="animate-fadeInUp">
              <p className="text-red-500 text-xl font-semibold tracking-widest animate-pulse">
                {t('system_warning')}
              </p>
            </div>

            <h1
              className="text-5xl md:text-7xl font-black my-4 glitch animate-fadeInUp"
              data-text={t('main_title')}
              style={{ animationDelay: '0.3s' }}
            >
              {t('main_title')}
            </h1>

            <p
              className="text-lg md:text-xl text-gray-300 mb-8 animate-fadeInUp"
              style={{ animationDelay: '0.6s' }}
            >
              {t('description_line1')}
              <br />
              {t('description_line2')}
            </p>

            <a
              href="/test"
              onClick={handleStartClick}
              // [수정] isStarting 상태에 따라 버튼을 비활성화하고 스타일을 변경합니다.
              className={`text-2xl font-bold px-10 py-4 rounded-md border-2
                          transition-all duration-300 animate-fadeInUp shadow-[0_0_20px_rgba(220,38,38,0.8)]
                          ${isStarting
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-900' // 비활성화된 스타일
                            : 'bg-red-600 text-white border-red-800 hover:bg-red-500 hover:scale-105 active:scale-100' // 활성화된 스타일
                          }`}
              style={{ animationDelay: '0.9s' }}
            >
              {t('start_button')}
            </a>
          </main>
        </>
      )}
    </div>
  );
}