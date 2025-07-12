// /app/test/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  question: string;
  options: string[];
};

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<{ question: string; options: string[]; selected: string }[]>([]);
  const [isFading, setIsFading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isShaking, setIsShaking] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isTestStarted) {
      const timer = setInterval(() => setCountdown(prev => (prev > 0 ? prev - 1 : 0)), 1000);
      const shakeInterval = setInterval(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }, 7000);
      return () => { clearInterval(timer); clearInterval(shakeInterval); audioRef.current?.pause(); };
    }
  }, [isTestStarted]);

  useEffect(() => {
    fetch('/api/generate-questions', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  const handleTestStart = () => {
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
        // 1. sessionStorage에 history 저장
        sessionStorage.setItem('testHistory', JSON.stringify(nextHistory));
        
        // [수정] 2. 광고가 있는 '분석 대기 페이지'로 이동
        router.push(`/loading`);
      }
    }, 300);
  };

  if (!isTestStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black text-white">
        <div className="text-red-500 border-4 border-red-500 p-4 rounded-lg">
          <h1 className="text-4xl font-bold">[긴급 재난 문자]</h1>
          <p className="text-xl mt-2">지구와의 연결이 1분 후 종료됩니다.</p>
        </div>
        <p className="mt-8 text-lg text-gray-300">AI가 인류 최종 데이터 분석을 시작합니다...</p>
        <button
          onClick={handleTestStart}
          disabled={questions.length === 0}
          className="mt-8 text-2xl font-bold bg-white text-black px-10 py-4 rounded-md border-2 border-gray-300
                     hover:bg-gray-200 hover:scale-105 active:scale-100
                     transition-all duration-300 disabled:bg-gray-500 disabled:cursor-wait"
        >
          {questions.length === 0 ? '데이터 수신 중...' : '[ 분석 시작하기 ]'}
        </button>
      </div>
    );
  }

  return (
    <main className={`min-h-screen bg-black text-white flex flex-col justify-center transition-transform duration-500 ${isShaking ? 'animate-shake' : ''}`}>
      <div className="fixed top-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <p className="text-red-500 font-bold text-lg animate-pulse">EMERGENCY</p>
          <p className="font-mono text-2xl text-red-500">[멸망까지 00:{countdown.toString().padStart(2, '0')}]</p>
        </div>
      </div>
      <div className="max-w-xl mx-auto p-6 text-center">
        <div className={`transition-opacity duration-300 ${isFading ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-8 whitespace-pre-line text-shadow-glow">{questions[step]?.question}</h2>
          <div className="flex flex-col gap-4">
            {questions[step]?.options.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(opt)} className="p-4 border-2 border-gray-600 rounded-lg text-lg bg-black/50 backdrop-blur-sm hover:bg-gray-800 hover:border-white transition-all duration-200 active:scale-95">
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
