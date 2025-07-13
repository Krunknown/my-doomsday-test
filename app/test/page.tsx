'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

type Question = {
  question: string;
  options: string[];
};

export default function TestPage() {
  const t = useTranslations('TestPage');
  const locale = useLocale();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<{ question: string; options: string[]; selected: string }[]>([]);
  const [isFading, setIsFading] = useState(false);
  const [countdown, setCountdown] = useState(60); // 초기 카운트다운 값 설정
  const [isShaking, setIsShaking] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. 질문 불러오기
  useEffect(() => {
    fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale })
    })
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, [locale]);

  // 2. 타이머 및 진동 효과 시작/정지 로직
  // 이 useEffect는 isTestStarted 상태 변화에 따라 타이머를 시작/클린업합니다.
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    let shakeInterval: NodeJS.Timeout | undefined;

    if (isTestStarted) {
      // 카운트다운 타이머 시작
      timer = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0)); // ✅ 오직 상태 값만 반환
      }, 1000);

      // 진동 효과 타이머 시작
      shakeInterval = setInterval(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }, 7000);
    }

    // 이 useEffect의 클린업 함수: 컴포넌트 언마운트 또는 isTestStarted 변경 시 실행
    return () => {
      if (timer) clearInterval(timer);
      if (shakeInterval) clearInterval(shakeInterval);
    };
  }, [isTestStarted]); // isTestStarted만 의존성에 두어 타이머의 생명주기 제어

  // 3. countdown이 0이 될 때 실행되는 사이드 이펙트 (핵심 수정 부분)
  // 이 새로운 useEffect는 `countdown`이 0이 되었을 때만 실행됩니다.
  // `router.push`와 같은 부수 효과(side effects)는 여기에 안전하게 배치합니다.
  useEffect(() => {
    // 테스트가 시작되었고 카운트다운이 0에 도달했을 때만 진행
    if (isTestStarted && countdown === 0) {
      console.log("⏱️ Countdown reached 0. Initiating redirect to /fail...");
      // 오디오 정지 및 초기화
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // 오디오를 처음으로 되돌림
      }
      
      // router.push는 React의 렌더링 외부에서 호출되므로 안전합니다.
      router.push('/fail');
    }
  }, [countdown, isTestStarted, router]); // countdown, isTestStarted, router를 의존성 배열에 추가

  const handleTestStart = () => {
    // 오디오는 테스트 시작 시 한 번만 초기화하고 재생합니다.
    audioRef.current = new Audio('/emergency-alert.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.7;
    audioRef.current.play().catch(e => console.error("Audio play failed:", e));

    setIsTestStarted(true);
    setIsFading(true);
  };

  const handleSelect = (option: string) => {
    setIsFading(false);
    setTimeout(() => {
      const current = questions[step];
      const nextHistory = [...history, {
        question: current.question,
        options: current.options,
        selected: option
      }];
      setHistory(nextHistory);

      if (step + 1 < questions.length) {
        setStep(step + 1);
        setIsFading(true);
      } else {
        sessionStorage.setItem('testHistory', JSON.stringify(nextHistory));
        router.push(`/loading`); // 테스트 성공 시 loading 페이지로 이동
      }
    }, 300);
  };

  if (!isTestStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black text-white">
        <div className="text-red-500 border-4 border-red-500 p-4 rounded-lg">
          <h1 className="text-4xl font-bold">{t('initial_title')}</h1>
          <p className="text-xl mt-2">{t('initial_subtitle')}</p>
        </div>
        <p className="mt-8 text-lg text-gray-300">{t('initial_description')}</p>
        <button
          onClick={handleTestStart}
          disabled={questions.length === 0}
          className="mt-8 text-2xl font-bold bg-white text-black px-10 py-4 rounded-md border-2 border-gray-300
                       hover:bg-gray-200 hover:scale-105 active:scale-100
                       transition-all duration-300 disabled:bg-gray-500 disabled:cursor-wait"
        >
          {questions.length === 0 ? t('loading_button') : t('ready_button')}
        </button>
      </div>
    );
  }

  return (
    <main className={`min-h-screen bg-black text-white flex flex-col justify-center transition-transform duration-500 ${isShaking ? 'animate-shake' : ''}`}>
      <div className="fixed top-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <p className="text-red-500 font-bold text-lg animate-pulse">{t('header_emergency')}</p>
          <p className="font-mono text-2xl text-red-500">[{t('header_countdown_prefix')} 00:{countdown.toString().padStart(2, '0')}]</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto p-6 text-center">
        <div className={`transition-opacity duration-300 ${isFading ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-8 whitespace-pre-line text-shadow-glow">
            {questions[step]?.question}
          </h2>
          <div className="flex flex-col gap-4">
            {questions[step]?.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="p-4 border-2 border-gray-600 rounded-lg text-lg bg-black/50 backdrop-blur-sm hover:bg-gray-800 hover:border-white transition-all duration-200 active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}