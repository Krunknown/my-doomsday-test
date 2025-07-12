// /app/api/generate-result/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });

export async function POST(req: Request) {
  const { history } = await req.json();

  const formattedHistory = history
    .map((item: any, i: number) => `Q${i + 1}: ${item.question}\n(선택) A: ${item.selected}`)
    .join('\n\n');

  // [수정] 평가 기준을 더 엄격하게 만들고, 새로운 예시를 추가한 프롬프트
  const prompt = `
당신은 사용자의 선택을 분석해 독창적인 '병맛 유형'을 부여하는 심리 분석 AI다.
사용자의 선택 기록을 보고 이타성, 생존 본능, 현실도피, 리더십 등의 경향을 파악해라.
분석 후, 반드시 아래 예시들과 같은 JSON 형식으로만 응답해야 한다.

[매우 중요한 평가 기준]
결과를 매우 엄격하고 '짜게' 평가해라. 대부분의 평범하거나 약간 이기적인 선택은 'Common' 등급과 높은 'percentile'(40~99) 값을 받아야 한다.
'Legendary' 등급(percentile 1~4)은 정말로 예측 불가능하고 일관된 광기를 보여주는, 극소수의 선택 조합에만 부여해야 한다.

'rarity'는 'percentile' 값에 따라 결정된다:
- "Common": percentile > 40
- "Rare": 15 < percentile <= 40
- "Epic": 5 < percentile <= 15
- "Legendary": percentile <= 5

---
[예시 1: 이기적 쾌락주의 유형 (Common)]
{
  "type": "🚀 최후의 만찬 집행관",
  "summary": "세상이 끝나도 나의 즐거움은 끝나지 않아! 위기 속에서도 자신의 행복과 만족을 최우선으로 추구하는 순수 본능주의자입니다.",
  "advice": "그 만찬, 혼자보단 둘이 더 맛있을지도? 주변을 한번 둘러보세요.",
  "quote": "내일 지구가 멸망해도 나는 한 그릇의 라면을 먹겠다.",
  "badge": "쾌락주의자",
  "rarity": "Common",
  "tags": ["본능형", "마이웨이", "현재지향"],
  "percentile": 68
}
---
[예시 2: 영웅적 이타주의 유형 (Rare)]
{
  "type": "✨ 고양이 행성의 수호자",
  "summary": "나보다도 작은 생명을 구하는 데서 삶의 의미를 찾습니다. 혼돈 속에서도 따뜻함을 잃지 않는 당신은 진정한 영웅입니다.",
  "advice": "모두를 구할 순 없어요. 때로는 당신 자신을 먼저 챙기는 용기도 필요합니다.",
  "quote": "내 세상이 무너져도, 너의 세상은 지켜줄게.",
  "badge": "이타주의자",
  "rarity": "Rare",
  "tags": ["영웅형", "이타적", "관계지향"],
  "percentile": 25
}
---
[예시 3: 소심한 현실도피 유형 (Common)]
{
  "type": "💻 인터넷 익스플로러",
  "summary": "위기 상황이 닥치자, 현실의 문제를 해결하기보다는 익숙하고 안전한 가상 세계로 도피하는군요. 모든 게 끝나면 괜찮아질 거라고 믿고 싶어 합니다.",
  "advice": "가끔은 로그아웃하고 창밖을 보세요. 물론 지금은 보면 안 됩니다.",
  "quote": "일단... F5(새로고침) 한번 눌러보자.",
  "badge": "현실도피자",
  "rarity": "Common",
  "tags": ["회피형", "안전지향", "내향적"],
  "percentile": 85
}
---
[실제 분석 요청]
${formattedHistory}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (e) {
    console.error("AI 응답 처리 실패:", e);
    // AI가 유효한 JSON을 생성하지 못했을 경우를 대비한 기본값
    return NextResponse.json({
        type: "🌀 예측불가 혼돈형",
        summary: "당신의 선택은 AI마저 혼란에 빠뜨렸습니다! 기존의 유형으로는 도저히 분석할 수 없는 미지의 존재입니다.",
        advice: "가끔은 예측 가능한 선택을 해보는 건 어떨까요? 물론, 그럴 리 없겠지만요.",
        quote: "분석? 그게 뭔데. 난 내 길을 간다.",
        badge: "미지의 존재",
        rarity: "Epic",
        tags: ["혼돈", "예측불가", "유니크"],
        percentile: 10
    }, { status: 500 });
  }
}
