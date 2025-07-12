// /app/api/generate-questions/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });

export async function POST() {
  // [수정] AI의 창의력을 자극하기 위해 예시와 지침을 강화한 프롬프트
  const prompt = `
너는 '지구 멸망 1분 전'이라는 주제로 황당하고 웃긴 심리테스트 질문을 만드는 AI다.
사용자의 본능적인 성향(이타심, 이기심, 쾌락주의, 찌질함, 관종력 등)을 파악할 수 있도록, 정답이 없는 딜레마 상황을 제시해야 한다.
아래 조건과 예시를 참고하여, 서로 다른 유형의 질문 5개를 순수 JSON 배열 형식으로만 생성해라. 절대로 설명이나 마크다운을 포함하지 마라.

[조건]
1.  질문은 총 5개, 각 질문에 대한 선택지는 3~4개여야 한다.
2.  모든 질문은 지구 멸망 직전의 구체적인 '병맛' 시나리오여야 한다.
3.  선택지는 사용자의 가치관을 드러내는 갈등을 유발해야 하며, 사용자의 허를 찌르는 예상치 못한 방향이어야 한다.
4.  질문들이 서로 비슷한 유형(예: 음식 얘기만)에 치우치지 않도록 다양하게 구성해야 한다.

[질문 예시 1: 사소한 집착]
{
  "question": "운석이 코앞에 떨어지는데, 넷플릭스 '다음화 자동재생'까지 5초 남았다. 당신의 선택은?",
  "options": ["당연히 다음화를 본다", "일단 잠시정지 후 창밖을 본다", "어차피 죽을 거, 넷플릭스 계정 삭제한다"]
}
[질문 예시 2: 인간관계]
{
  "question": "옆집 웬수가 '같이 살자'며 현관문을 미친듯이 두드린다. 당신의 선택은?",
  "options": ["이때다 싶어 문을 잠근다", "일단 열어주고 상황을 본다", "인터폰에 대고 마지막 욕을 시전한다"]
}
[질문 예시 3: 흑역사]
{
  "question": "마지막 순간, 인터넷 브라우저에 당신의 흑역사 검색기록이 그대로 남아있다. 어떻게 할까?",
  "options": ["어차피 다 죽는데 그냥 둔다", "컴퓨터 본체를 부순다", "가장 부끄러운 기록 하나만 지운다"]
}
[질문 예시 4: 마지막 SNS]
{
  "question": "지구 멸망이 확정된 지금, 당신의 SNS에 마지막 게시물을 올릴 수 있다. 무엇을 올릴 것인가?",
  "options": ["'#지구멸망 #마지막날' 해시태그와 함께 셀카를 올린다", "가족/친구에게 보내는 마지막 편지를 쓴다", "아무도 안 궁금해할 TMI를 방출한다", "좋아요를 가장 많이 받았던 게시물을 재업로드한다"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
    
    const json = JSON.parse(jsonText);
    return NextResponse.json(json);
  } catch (e) {
    console.error("AI 응답 처리 실패:", e);
    // AI 응답 실패 시 사용할 비상용 질문 리스트
    const fallbackQuestions = [
      {
        "question": "AI가 응답하지 않습니다. 당신 탓인 것 같습니다. 어떻게 하시겠습니까?",
        "options": ["내 탓을 한다", "AI 탓을 한다", "인터넷 탓을 한다"]
      },
      {
        "question": "비상용 질문이 나타났습니다. 왠지 희귀한 결과를 볼 수 있을 것 같습니다. 기분이 어떻습니까?",
        "options": ["오히려 좋아", "찝찝하다", "아무 생각 없다"]
      }
    ];
    return NextResponse.json(fallbackQuestions, { status: 500 });
  }
}
