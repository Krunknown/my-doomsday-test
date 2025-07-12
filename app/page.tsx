// src/app/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // [수정] 첫 클릭 시 배경음악만 활성화하는 함수
  const handleEnter = () => {
    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio('/ambient-noise.mp3');
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.volume = 0.5;
    }
    
    ambientAudioRef.current.play().catch(error => console.error("배경음악 재생 실패:", error));
    
    setSoundEnabled(true);
  };

  // [추가] '최종 분석 시작' 버튼 클릭 시 효과음 재생 및 페이지 이동
  const handleStartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const clickSound = new Audio('/click.mp3');
    clickSound.volume = 0.7;
    clickSound.play();

    // 페이지를 벗어날 때 배경음악을 서서히 줄여서 끄는 효과
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

  // 페이지를 벗어날 때 실행되는 정리 함수
  useEffect(() => {
    return () => {
      ambientAudioRef.current?.pause();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/*
        ... 배경 영상 코드가 있다면 여기에 ...
      */}

      {/* 사운드 활성화 전/후로 다른 화면을 보여줌 */}
      {!soundEnabled ? (
        // [복원] 사운드 활성화를 유도하는 초기 화면
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white/80 mb-8 animate-pulse">
            지구 멸망까지... 1분
          </h1>
          <button
            onClick={handleEnter} // 이 버튼에서는 클릭 효과음 없음
            className="text-2xl font-bold bg-white text-black px-10 py-4 rounded-md border-2 border-gray-300
                       hover:bg-gray-200 hover:scale-105 active:scale-100
                       transition-all duration-300"
          >
            [ 연결 및 사운드 활성화 ]
          </button>
        </div>
      ) : (
        // 사운드 활성화 후 보여줄 메인 콘텐츠
        <>
          <main className="relative flex-grow flex flex-col items-center justify-center p-4 text-center z-10">
            <div className="animate-fadeInUp">
              <p className="text-red-500 text-xl font-semibold tracking-widest animate-pulse">
                [SYSTEM WARNING]
              </p>
            </div>

            <h1
              className="text-5xl md:text-7xl font-black my-4 glitch animate-fadeInUp"
              data-text="지구 멸망 1분 전"
              style={{ animationDelay: '0.3s' }}
            >
              지구 멸망 1분 전
            </h1>

            <p
              className="text-lg md:text-xl text-gray-300 mb-8 animate-fadeInUp"
              style={{ animationDelay: '0.6s' }}
            >
              마지막 순간, 당신의 본능은 무엇을 선택할 것인가?
              <br />
              정체불명의 AI가 당신의 심리를 분석합니다.
            </p>

            <a
              href="/test"
              onClick={handleStartClick} // 이 버튼에서는 클릭 효과음 재생
              className="text-2xl font-bold bg-red-600 text-white px-10 py-4 rounded-md border-2 border-red-800
                         hover:bg-red-500 hover:scale-105 active:scale-100
                         transition-all duration-300 animate-fadeInUp shadow-[0_0_20px_rgba(220,38,38,0.8)]"
              style={{ animationDelay: '0.9s' }}
            >
              최종 분석 시작
            </a>
          </main>
        </>
      )}
    </div>
  );
}