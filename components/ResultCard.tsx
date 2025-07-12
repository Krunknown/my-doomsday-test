// src/components/ResultCard.tsx

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
  return (
    <div className="bg-gray-800/50 p-8 rounded-xl text-white w-full">
      <div className="text-center">
        <p className={`font-bold text-xl ${rarityColor[result.rarity] || 'text-gray-400'}`}>
          {result.rarity}
        </p>
        <h1 className="text-4xl font-extrabold my-2 text-shadow-glow">{result.type}</h1>
        <p className="text-lg text-gray-300">{result.summary}</p>
      </div>

      <div className="my-8 border-t border-b border-gray-600 py-6 text-center">
        <p className="text-2xl italic">"{result.quote}"</p>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-2 text-green-400">AI의 생존 조언</h3>
        <p className="text-gray-300">{result.advice}</p>
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-xl mb-3 text-green-400">주요 특성</h3>
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