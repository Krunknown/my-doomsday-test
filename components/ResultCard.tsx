// src/components/ResultCard.tsx

import { useTranslations } from 'next-intl'; // [추가] 다국어 처리를 위한 훅

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

// 희귀도에 따른 색상 정의
const rarityColor: { [key: string]: string } = {
  "Common": "text-gray-400",
  "Rare": "text-blue-400",
  "Epic": "text-purple-400",
  "Legendary": "text-yellow-300",
};

export function ResultCard({ result }: { result: Result }) {
  // [추가] 'ResultCard'와 'RarityLevels' 사전을 사용하겠다고 선언
  const t = useTranslations('ResultCard');
  const tRarity = useTranslations('RarityLevels');

  return (
    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl text-white w-full">
      <div className="text-center">
        <p className={`font-bold text-xl ${rarityColor[result.rarity] || 'text-gray-400'}`}>
          {/* [수정] AI가 보낸 rarity 값을 키로 사용하여 번역된 텍스트를 표시 */}
          {tRarity(result.rarity)}
        </p>
        <h1 className="text-4xl font-extrabold my-2 text-shadow-glow">{result.type}</h1>
        <p className="text-lg text-gray-300">{result.summary}</p>
      </div>

      <div className="my-8 border-t border-b border-gray-600/50 py-6 text-center">
        <p className="text-2xl italic">"{result.quote}"</p>
      </div>

      <div>
        {/* [수정] 하드코딩된 텍스트를 t() 함수로 변경 */}
        <h3 className="font-bold text-xl mb-2 text-green-400">{t('survival_advice_title')}</h3>
        <p className="text-gray-300">{result.advice}</p>
      </div>

      <div className="mt-8">
        {/* [수정] 하드코딩된 텍스트를 t() 함수로 변경 */}
        <h3 className="font-bold text-xl mb-3 text-green-400">{t('main_traits_title')}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-yellow-400/20 text-yellow-300 text-sm font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-400">
            {result.badge}
          </span>
          {result.tags.map(tag => (
            <span key={tag} className="bg-gray-700 text-gray-300 text-sm font-medium me-2 px-2.5 py-0.5 rounded border border-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
