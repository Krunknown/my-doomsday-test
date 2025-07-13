// /app/fail/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useTranslations } from 'next-intl';

// 실패 스캐너 애니메이션 컴포넌트
const FailScannerAnimation = ({ colorClass = 'text-red-500' }) => (
  <div className="relative w-48 h-48">
    <div className={`absolute inset-0 border-2 ${colorClass}/30 rounded-full animate-spin`} style={{ animationDuration: '5s' }}></div>
    <div className={`absolute inset-2 border-${colorClass.split('-')[1]}-500/20 rounded-full animate-spin`} style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className={`w-24 h-24 ${colorClass}/70`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="absolute inset-0 overflow-hidden rounded-full">
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-${colorClass.split('-')[1]}-500/10 animate-ping`} style={{ animationDuration: '3s' }}></div>
      <div className={`absolute w-full h-1 bg-${colorClass.split('-')[1]}-400 shadow-[0_0_15px_rgba(255,0,0,0.8)] top-1/2 -translate-y-1/2 animate-pulse`} style={{ animationDuration: '1.5s' }}></div>
    </div>
  </div>
);

// AdSense 광고 컴포넌트 (프로덕션 환경용)
const AdsenseAd = () => {
  const adPushed = useRef(false);
  useEffect(() => {
    if (!adPushed.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch (_) {}
    }
  }, []);
  return (
    <ins className="adsbygoogle"
      style={{ display: 'inline-block', width: '300px', height: '250px' }}
      data-ad-client="ca-pub-8827080947099772"
      data-ad-slot="7075534419"></ins>
  );
};

// 가짜 AdSense 광고 컴포넌트 (개발 환경용)
const FakeAdsenseAd = () => (
  <div className="w-[300px] h-[250px] bg-gray-700 flex items-center justify-center text-center text-white/50 p-4">
    <p>광고 테스트 영역<br />(300x250)</p>
  </div>
);

export default function FailPage() {
  const t = useTranslations('FailPage');
  const router = useRouter();

  const failMessages = t.raw('messages') as string[];
  const [displayedFailMessage, setDisplayedFailMessage] = useState<string | null>(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [currentStatusMessage, setCurrentStatusMessage] = useState(t('reboot_status_message'));

  const doomSoundRef = useRef<HTMLAudioElement | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  // 사용자가 페이지와 상호작용했는지 여부 (사운드 재생 트리거)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // 버튼 누르고 있는지 여부
  const [isPressing, setIsPressing] = useState(false);
  // 데이터 전송 중 (로딩 UI 표시) 여부
  const [isLoading, setIsLoading] = useState(false);
  // 로딩 타이머 (꾹 누르기 시간 측정)
  const loadingTimer = useRef<NodeJS.Timeout | null>(null);
  // 사운드 페이드아웃 인터벌 ID를 저장할 Ref
  const fadeOutIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    // 초기 실패 메시지 설정
    const randomIndex = Math.floor(Math.random() * failMessages.length);
    setDisplayedFailMessage(failMessages?.[randomIndex] || '');

    // 멸망 사운드 객체 미리 로드 및 설정 (재생은 사용자 상호작용 후)
    if (!doomSoundRef.current) {
      doomSoundRef.current = new Audio('/doom-sound.mp3');
      doomSoundRef.current.volume = 0.7;
      doomSoundRef.current.loop = true;
    }

    // '다시 분석하기' 버튼 활성화 타이머
    const enableButtonTimer = setTimeout(() => {
      setIsButtonEnabled(true);
      setCurrentStatusMessage(t('reboot_complete_message'));
    }, 7000); // 7초 후 버튼 활성화

    // 20초 후 자동 홈 리다이렉트 타이머
    const autoRedirectTimer = setTimeout(() => {
      // 리다이렉트 전에 멸망 사운드 페이드아웃
      if (doomSoundRef.current && !doomSoundRef.current.paused) {
        let volume = doomSoundRef.current.volume;
        // setInterval의 ID를 저장하여 나중에 정리할 수 있도록 함
        fadeOutIntervalRef.current = setInterval(() => {
          // 인터벌 내부에서 다시 한번 Ref가 유효한지 확인
          if (doomSoundRef.current) {
            volume -= 0.05;
            if (volume > 0) {
              doomSoundRef.current.volume = volume;
            } else {
              doomSoundRef.current.pause();
              clearInterval(fadeOutIntervalRef.current!); // 인터벌 정리
              fadeOutIntervalRef.current = null; // Ref 초기화
            }
          } else {
            // Ref가 null이면 더 이상 진행할 수 없으니 인터벌 정리
            clearInterval(fadeOutIntervalRef.current!);
            fadeOutIntervalRef.current = null;
          }
        }, 30); // 0.03초마다 볼륨 감소
      }
      router.push('/'); // 페이지 이동
    }, 20000); // 20초 후 자동 리다이렉트

    // 컴포넌트 언마운트 시 모든 타이머 및 사운드 리소스 정리
    return () => {
      clearTimeout(enableButtonTimer);
      clearTimeout(autoRedirectTimer);
      if (fadeOutIntervalRef.current) { // 진행 중인 페이드아웃 인터벌이 있다면 정리
        clearInterval(fadeOutIntervalRef.current);
        fadeOutIntervalRef.current = null;
      }
      if (doomSoundRef.current) { // 멸망 사운드 정지 및 리소스 해제
        doomSoundRef.current.pause();
        doomSoundRef.current = null;
      }
      if (loadingTimer.current) { // 로딩 타이머 정리
        clearTimeout(loadingTimer.current);
        loadingTimer.current = null;
      }
    };
  }, [failMessages, t, router]); // 의존성 배열에 t, router, failMessages 포함

  // '실패 데이터 전송' 버튼 꾹 누르기 시작
  const handleMouseDown = () => {
    setIsPressing(true);
    // 0.8초 후 로딩 상태로 변경 (데이터 전송 시도 시뮬레이션)
    loadingTimer.current = setTimeout(() => {
      setIsLoading(true);
    }, 800); // 0.8초 이상 누르면 로딩 시작
  };

  // '실패 데이터 전송' 버튼 꾹 누르기 종료
  const handleMouseUp = () => {
    setIsPressing(false); // 누르기 종료 상태
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current); // 로딩 타이머 취소
      loadingTimer.current = null;
    }

    // 로딩 중이었다면 (즉, 0.8초 이상 눌렀다면) 상호작용 완료 처리 및 사운드 재생
    if (isLoading) {
      if (!hasUserInteracted) {
        setHasUserInteracted(true); // 사용자 상호작용 완료
        if (doomSoundRef.current) {
          doomSoundRef.current.play().catch(e => {
            console.error("둠 사운드 재생 실패 (꾹 누르기 후):", e);
          });
        }
      }
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  // '다시 분석하기' 버튼 클릭 핸들러
  const handleRetryClick = () => {
    // 버튼이 활성화 상태가 아니거나 이미 처리 중이면 중단
    if (!isButtonEnabled || isRetrying) {
      return;
    }
    setIsRetrying(true); // 재시작 처리 시작

    // 클릭 사운드 재생
    const clickSound = new Audio('/click.mp3');
    clickSound.volume = 0.7;
    clickSound.play().catch(error => console.error("클릭 사운드 재생 실패:", error));

    // 멸망 사운드 페이드아웃 (재생 중일 때만)
    if (doomSoundRef.current && !doomSoundRef.current.paused) {
      let volume = doomSoundRef.current.volume;
      // setInterval의 ID를 저장하여 나중에 정리할 수 있도록 함
      fadeOutIntervalRef.current = setInterval(() => {
        // 인터벌 내부에서 다시 한번 Ref가 유효한지 확인
        if (doomSoundRef.current) {
          volume -= 0.05;
          if (volume > 0) {
            doomSoundRef.current.volume = volume;
          } else {
            doomSoundRef.current.pause();
            clearInterval(fadeOutIntervalRef.current!); // 인터벌 정리
            fadeOutIntervalRef.current = null; // Ref 초기화
          }
        } else {
          // Ref가 null이면 더 이상 진행할 수 없으니 인터벌 정리
          clearInterval(fadeOutIntervalRef.current!);
          fadeOutIntervalRef.current = null;
        }
      }, 30);
    }

    // 약간의 딜레이 후 페이지 이동
    setTimeout(() => {
      router.push('/test');
    }, 300); // 클릭 사운드 재생 및 페이드아웃에 필요한 시간
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black text-white overflow-hidden">
      {/* 프로덕션 환경에서만 Google AdSense 스크립트 로드 */}
      {process.env.NODE_ENV === 'production' && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8827080947099772"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* 배경 블러 및 광선 효과 */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,0,0,0.3),rgba(255,255,255,0))] opacity-40"></div>

      {/* 사용자의 초기 상호작용 (꾹 누르기) 대기 화면 */}
      {!hasUserInteracted ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h1 className="text-4xl md:text-6xl font-black text-white/80 mb-8 animate-pulse">
            {t('data_transfer_failed_title')} {/* "데이터 전송 실패" */}
          </h1>
          <p className="text-lg text-gray-300 mb-6">{t('hold_to_attempt_transfer')}</p> {/* "버튼을 꾹 눌러 데이터 전송을 시도하세요..." */}
          <button
            className={`relative text-xl font-bold bg-red-600 text-white px-12 py-5 rounded-md border-2 border-red-800 hover:bg-red-500 active:bg-red-700 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.8)] ${isPressing ? 'scale-95' : ''}`}
            onMouseDown={handleMouseDown} // 마우스 클릭 시작
            onMouseUp={handleMouseUp}     // 마우스 클릭 종료
            onMouseLeave={handleMouseUp}  // 마우스가 버튼 밖으로 벗어났을 때도 종료 처리
            onTouchStart={handleMouseDown} // 터치 시작
            onTouchEnd={handleMouseUp}     // 터치 종료
            onTouchCancel={handleMouseUp}  // 터치 취소 (예: 전화 왔을 때)
            disabled={hasUserInteracted} // 한 번 상호작용하면 버튼 비활성화
          >
            {isLoading ? ( // 로딩 중일 때 로딩 스피너 표시
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full border-4 border-t-red-500 animate-spin" />
              </div>
            ) : ( // 로딩 중이 아닐 때 버튼 텍스트 표시
              t('transfer_fail_data_button') // "실패 데이터 전송"
            )}
          </button>
        </div>
      ) : (
        // 사용자의 초기 상호작용 후 보여질 실제 FailPage 내용
        <div className="flex flex-col items-center justify-center flex-grow transition-opacity duration-1000 opacity-100">
          <FailScannerAnimation colorClass="text-red-500" />

          {displayedFailMessage && (
            <p className="text-3xl font-bold mt-8 font-mono animate-pulse text-red-500">{displayedFailMessage}</p>
          )}
          <p className="text-xl text-gray-400 mt-4">{t('sub_message')}</p>
          <p className="text-lg text-yellow-300 mt-6 animate-pulse">{currentStatusMessage}</p>

          <div className="mt-8 flex flex-col items-center w-full space-y-2 relative z-10">
            <p className="text-sm text-gray-500">{t('ad_notice')}</p>
            <div className="w-[300px] h-[250px] bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-center backdrop-blur-sm overflow-hidden">
              {process.env.NODE_ENV === 'production' ? <AdsenseAd /> : <FakeAdsenseAd />}
            </div>

            <button
              onClick={handleRetryClick}
              disabled={!isButtonEnabled || isRetrying}
              className={`mt-6 text-xl font-bold px-10 py-4 rounded-md border-2 transition-all duration-300
                ${(isButtonEnabled && !isRetrying)
                  ? 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-100'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
            >
              {t('retry_analysis_button')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}