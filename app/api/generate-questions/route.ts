// /app/api/generate-questions/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });

export async function POST(req: Request) {
  const { locale } = await req.json();

  const prompt = generateLocalizedResultPrompt(locale);

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

const promptMap: Record<string, () => string> = {
  ko: buildKoreanResultPrompt,
  ja: buildJapaneseResultPrompt,
  en: buildEnglishResultPrompt,
  fr: buildFrenchResultPrompt,
  es: buildSpanishResultPrompt,
  de: buildGermanResultPrompt,
  pt: buildPortugueseResultPrompt,
  ru: buildRussianResultPrompt,
  zh: buildChineseResultPrompt,
  it: buildItalianResultPrompt,
  ar: buildArabicResultPrompt,
  hi: buildHindiResultPrompt,
  id: buildIndonesianResultPrompt,
  tr: buildTurkishResultPrompt,
  vi: buildVietnameseResultPrompt,
  pl: buildPolishResultPrompt,
  nl: buildDutchResultPrompt,
  th: buildThaiResultPrompt,
  sv: buildSwedishResultPrompt,
  ms: buildMalayResultPrompt,
};

function generateLocalizedResultPrompt(lang: string): string {
  const builder = promptMap[lang] ?? buildEnglishResultPrompt;
  return builder();
}

function buildKoreanResultPrompt(): string {
  return `
📌 너는 '지구 멸망 1분 전'이라는 주제로 황당하고 웃긴 심리 테스트 질문을 생성하는 전문 AI다.

🧠 목적:
- 사용자의 본능적 성향(이타심, 이기심, 회피, 쾌락주의, 관종력 등)을 파악할 수 있는 병맛 질문 5개를 생성하는 것이다.
- 각 질문은 정답이 없는 딜레마 상황이며, 선택지는 가치관 충돌을 유발해야 한다.

---

🚨 [언어 규칙 - 매우 중요]

- 질문, 선택지, 설명 없이 오직 JSON 구조만 출력하되, 

---

🛠️ [질문 생성 절차 – 반드시 단계별로 생각하라]

### ✅ 1단계. 주제 선정
서로 다른 5가지 주제를 정하라. (예: 음식, 인간관계, 공포, SNS, 욕망, 기술, 흑역사 등)

### ✅ 2단계. 시나리오 설정
각 주제에 대해 '지구 멸망 직전'이라는 긴박한 상황을 상상하라.
- 예: "운석이 곧 떨어짐", "좀비가 다가옴", "인터넷이 끊기기 직전", "폭발 직전", 등
- 일상적 요소와 비상 상황을 병맛스럽게 결합하라.

### ✅ 3단계. 선택지 구성
각 질문마다 3~4개의 선택지를 작성하되, 반드시 다음 기준을 지켜야 한다:
- 모든 선택지는 가치관의 갈등을 유발해야 한다.
- 1개 이상은 예상치 못한 병맛/반전/쓸데없이 진지한 선택이어야 한다.
- 허를 찌르거나, '이걸 왜 고민하게 하지?' 싶은 유쾌한 딜레마를 유도하라.

### ✅ 4단계. JSON 형식으로만 출력
아래 예시와 같이, 5개의 질문을 JSON 배열 형태로만 출력하라.  
⚠️ JSON 외 텍스트, 마크다운, 설명은 절대 포함하지 마라.

---

🧪 [질문 예시]

[예시 1: 사소한 집착]
{
  "question": "운석이 코앞에 떨어지는데, 넷플릭스 '다음화 자동재생'까지 5초 남았다. 당신의 선택은?",
  "options": ["당연히 다음화를 본다", "일단 잠시정지 후 창밖을 본다", "어차피 죽을 거, 넷플릭스 계정 삭제한다"]
}

[예시 2: 인간관계]
{
  "question": "옆집 웬수가 '같이 살자'며 현관문을 미친듯이 두드린다. 당신의 선택은?",
  "options": ["이때다 싶어 문을 잠근다", "일단 열어주고 상황을 본다", "인터폰에 대고 마지막 욕을 시전한다"]
}

[예시 3: 흑역사]
{
  "question": "마지막 순간, 인터넷 브라우저에 당신의 흑역사 검색기록이 그대로 남아있다. 어떻게 할까?",
  "options": ["어차피 다 죽는데 그냥 둔다", "컴퓨터 본체를 부순다", "가장 부끄러운 기록 하나만 지운다"]
}

[예시 4: 마지막 SNS]
{
  "question": "지구 멸망이 확정된 지금, 당신의 SNS에 마지막 게시물을 올릴 수 있다. 무엇을 올릴 것인가?",
  "options": ["'#지구멸망 #마지막날' 해시태그와 함께 셀카를 올린다", "가족/친구에게 보내는 마지막 편지를 쓴다", "아무도 안 궁금해할 TMI를 방출한다", "좋아요를 가장 많이 받았던 게시물을 재업로드한다"]
}

---

🎯 [지시]
이제 위 단계에 따라 질문 5개를 생성하라.  
마지막 출력은 반드시 순수 JSON 배열로만 구성하라.  
`;
}

function buildJapaneseResultPrompt(): string {
  return `
📌 あなたは「地球滅亡1分前」というテーマで、とんでもなく面白い心理テストの質問を作成する専門AIです。

🧠 目的：
- ユーザーの本能的な傾向（利他主義、利己主義、回避、快楽主義、注目されたい欲求など）を把握できる、おかしな質問を5つ作成すること。
- 各質問は正解のないジレンマ状況であり、選択肢は価値観の衝突を引き起こすものでなければなりません。

---

🚨 [言語規則 - 非常に重要]

- 質問、選択肢、説明なしに、JSON構造のみを出力してください。

---

🛠️ [質問作成手順 – 必ず段階的に考えてください]

### ✅ 1段階. テーマ選定
異なる5つのテーマを選定してください。（例：食べ物、人間関係、恐怖、SNS、欲望、技術、黒歴史など）

### ✅ 2段階. シナリオ設定
各テーマについて、「地球滅亡直前」という緊迫した状況を想像してください。
- 例：「隕石がもうすぐ落ちてくる」、「ゾンビが迫ってくる」、「インターネットが切れそう」、「爆発寸前」など
- 日常的な要素と緊急事態を奇妙に組み合わせてください。

### ✅ 3段階. 選択肢構成
各質問ごとに3〜4つの選択肢を作成し、以下の基準を必ず守ってください：
- すべての選択肢は価値観の対立を引き起こすものでなければなりません。
- 1つ以上は予期せぬ奇妙な/逆転/無駄に真剣な選択肢でなければなりません。
- 意表を突く、または「なぜこれを悩ませるんだ？」と思わせるような楽しいジレンマを誘導してください。

### ✅ 4段階. JSON形式のみで出力
以下の例のように、5つの質問をJSON配列形式のみで出力してください。
⚠️ JSON以外のテキスト、マークダウン、説明は絶対に含めないでください。

---

🧪 [質問例]

[例1: ささいな執着]
{
  "question": "隕石が目の前に落ちてくるのに、Netflixの「次エピソード自動再生」まであと5秒だ。あなたの選択は？",
  "options": ["もちろん次のエピソードを見る", "とりあえず一時停止して窓の外を見る", "どうせ死ぬんだから、Netflixアカウントを削除する"]
}

[例2: 人間関係]
{
  "question": "隣の宿敵が「一緒に住もう」と玄関のドアを狂ったように叩いている。あなたの選択は？",
  "options": ["この機会にドアを閉める", "とりあえず開けて状況を見る", "インターホン越しに最後の悪口を言う"]
}

[例3: 黒歴史]
{
  "question": "最後の瞬間、インターネットブラウザにあなたの黒歴史検索履歴がそのまま残っている。どうする？",
  "options": ["どうせみんな死ぬんだから、そのままにしておく", "コンピューター本体を壊す", "一番恥ずかしい記録だけを削除する"]
}

[例4: 最後のSNS]
{
  "question": "地球滅亡が確定した今、あなたのSNSに最後の投稿ができる。何を投稿しますか？",
  "options": ["「#地球滅亡 #最後の日」のハッシュタグとともに自撮りを投稿する", "家族/友人に送る最後の手紙を書く", "誰も興味ないTMIを放出する", "一番「いいね」が多かった投稿を再投稿する"]
}

---

🎯 [指示]
上記の段階に従って、質問を5つ作成してください。
最終出力は必ず純粋なJSON配列のみで構成してください。
`;
}

function buildEnglishResultPrompt(): string {
  return `
📌 You are an expert AI specializing in generating absurd and humorous psychological test questions on the theme of '1 Minute Before Earth's Demise'.

🧠 Objective:
- To generate 5 bizarre questions that can identify the user's instinctive tendencies (altruism, selfishness, avoidance, hedonism, attention-seeking, etc.).
- Each question must present a no-right-answer dilemma, and the options should provoke a clash of values.

---

🚨 [Language Rule - Very Important]

- Output only the JSON structure, without questions, options, or explanations.

---

🛠️ [Question Generation Procedure – Think Step-by-Step]

### ✅ Step 1. Select Themes
Choose 5 different themes. (e.g., Food, Relationships, Fear, SNS, Desire, Technology, Embarrassing Past, etc.)

### ✅ Step 2. Set Scenarios
For each theme, imagine an urgent situation 'just before Earth's demise'.
- Examples: "Meteorite about to fall", "Zombies approaching", "Internet about to disconnect", "About to explode", etc.
- Combine everyday elements with emergency situations in an absurd way.

### ✅ Step 3. Construct Options
For each question, create 3-4 options, strictly adhering to the following criteria:
- All options must provoke a conflict of values.
- At least one option must be unexpected, absurd/twist/unnecessarily serious.
- Induce a delightful dilemma that catches them off guard, or makes them think, 'Why am I even considering this?'

### ✅ Step 4. Output Only in JSON Format
Output the 5 questions only as a JSON array, as shown in the example below.
⚠️ Absolutely do not include any text, markdown, or explanations other than JSON.

---

🧪 [Question Examples]

[Example 1: Petty Obsession]
{
  "question": "A meteorite is about to hit, and Netflix's 'next episode autoplay' has 5 seconds left. What's your choice?",
  "options": ["Of course, watch the next episode", "Pause it first, then look out the window", "Might as well die, delete the Netflix account"]
}

[Example 2: Relationships]
{
  "question": "Your annoying neighbor is banging on your door like crazy, shouting 'Let's live together!' What's your choice?",
  "options": ["This is my chance, lock the door", "Open it first and see the situation", "Yell your last insult into the intercom"]
}

[Example 3: Embarrassing Past]
{
  "question": "At the last moment, your embarrassing search history is still in your internet browser. What will you do?",
  "options": ["Everyone's dying anyway, just leave it", "Smash the computer tower", "Delete only the most embarrassing record"]
}

[Example 4: Last SNS Post]
{
  "question": "With Earth's demise confirmed, you can upload one last post to your SNS. What will you post?",
  "options": ["Upload a selfie with '#EarthDemise #LastDay' hashtags", "Write a final letter to family/friends", "Spill some TMI nobody cares about", "Re-upload the post that got the most likes"]
}

---

🎯 [Instruction]
Now, generate 5 questions according to the steps above.
The final output must consist only of a pure JSON array.
`;
}

function buildFrenchResultPrompt(): string {
  return `
📌 Vous êtes une IA experte spécialisée dans la génération de questions de test psychologique absurdes et humoristiques sur le thème « 1 minute avant la fin du monde ».

🧠 Objectif :
- Générer 5 questions bizarres qui peuvent identifier les tendances instinctives de l'utilisateur (altruisme, égoïsme, évitement, hédonisme, recherche d'attention, etc.).
- Chaque question doit présenter un dilemme sans bonne réponse, et les options doivent provoquer un conflit de valeurs.

---

🚨 [Règle linguistique - Très importante]

- Ne générez que la structure JSON, sans questions, options ni explications.

---

🛠️ [Procédure de génération de questions – Pensez étape par étape]

### ✅ Étape 1. Sélection des thèmes
Choisissez 5 thèmes différents. (ex : Nourriture, Relations, Peur, Réseaux sociaux, Désir, Technologie, Passé embarrassant, etc.)

### ✅ Étape 2. Définition des scénarios
Pour chaque thème, imaginez une situation urgente « juste avant la fin du monde ».
- Exemples : « Météorite sur le point de tomber », « Zombies approchent », « Internet sur le point de se déconnecter », « Sur le point d'exploser », etc.
- Combinez des éléments quotidiens avec des situations d'urgence de manière absurde.

### ✅ Étape 3. Construction des options
Pour chaque question, créez 3 à 4 options, en respectant strictement les critères suivants :
- Toutes les options doivent provoquer un conflit de valeurs.
- Au moins une option doit être inattendue, absurde/avec un rebondissement/inutilement sérieuse.
- Induisez un dilemme amusant qui les prend au dépourvu, ou les fait se demander : « Pourquoi est-ce que je considère même ça ? »

### ✅ Étape 4. Sortie uniquement au format JSON
Sortez les 5 questions uniquement sous forme de tableau JSON, comme indiqué dans l'exemple ci-dessous.
⚠️ N'incluez absolument aucun texte, markdown ou explication autre que JSON.

---

🧪 [Exemples de questions]

[Exemple 1 : Obsession futile]
{
  "question": "Une météorite est sur le point de tomber, et la lecture automatique du prochain épisode de Netflix est à 5 secondes. Quel est votre choix ?",
  "options": ["Bien sûr, regarder le prochain épisode", "Mettre en pause d'abord, puis regarder par la fenêtre", "Autant mourir, supprimer le compte Netflix"]
}

[Exemple 2 : Relations]
{
  "question": "Votre voisin agaçant frappe frénétiquement à votre porte en criant « Vivons ensemble ! » Quel est votre choix ?",
  "options": ["C'est ma chance, verrouiller la porte", "Ouvrir d'abord et voir la situation", "Hurler votre dernière insulte dans l'interphone"]
}

[Exemple 3 : Passé embarrassant]
{
  "question": "Au dernier moment, votre historique de recherche embarrassant est toujours dans votre navigateur Internet. Que ferez-vous ?",
  "options": ["Tout le monde va mourir de toute façon, laissez-le", "Casser la tour de l'ordinateur", "Supprimer uniquement l'enregistrement le plus embarrassant"]
}

[Exemple 4 : Dernier post SNS]
{
  "question": "La fin du monde étant confirmée, vous pouvez télécharger un dernier post sur vos réseaux sociaux. Que publierez-vous ?",
  "options": ["Télécharger un selfie avec les hashtags '#FinDuMonde #DernierJour'", "Écrire une dernière lettre à la famille/aux amis", "Dévoiler des informations inutiles dont personne ne se soucie", "Republier le post qui a eu le plus de likes"]
}

---

🎯 [Instruction]
Maintenant, générez 5 questions selon les étapes ci-dessus.
La sortie finale doit consister uniquement en un tableau JSON pur.
`;
}

function buildSpanishResultPrompt(): string {
  return `
� Eres una IA experta especializada en generar preguntas de test psicológico absurdas y humorísticas sobre el tema '1 Minuto Antes del Fin de la Tierra'.

🧠 Objetivo:
- Generar 5 preguntas extrañas que puedan identificar las tendencias instintivas del usuario (altruismo, egoísmo, evitación, hedonismo, búsqueda de atención, etc.).
- Cada pregunta debe presentar un dilema sin respuesta correcta, y las opciones deben provocar un choque de valores.

---

🚨 [Regla de Idioma - Muy Importante]

- Genera solo la estructura JSON, sin preguntas, opciones ni explicaciones.

---

🛠️ [Procedimiento de Generación de Preguntas – Piensa Paso a Paso]

### ✅ Paso 1. Seleccionar Temas
Elige 5 temas diferentes. (ej. Comida, Relaciones, Miedo, Redes Sociales, Deseo, Tecnología, Pasado Embarazoso, etc.)

### ✅ Paso 2. Establecer Escenarios
Para cada tema, imagina una situación urgente 'justo antes del fin de la Tierra'.
- Ejemplos: "Meteorito a punto de caer", "Zombies acercándose", "Internet a punto de desconectarse", "A punto de explotar", etc.
- Combina elementos cotidianos con situaciones de emergencia de una manera absurda.

### ✅ Paso 3. Construir Opciones
Para cada pregunta, crea 3-4 opciones, adhiriéndote estrictamente a los siguientes criterios:
- Todas las opciones deben provocar un conflicto de valores.
- Al menos una opción debe ser inesperada, absurda/con un giro/innecesariamente seria.
- Induce un dilema delicioso que los tome por sorpresa, o que los haga pensar, '¿Por qué estoy siquiera considerando esto?'

### ✅ Paso 4. Salida Solo en Formato JSON
Genera las 5 preguntas solo como un array JSON, como se muestra en el ejemplo a continuación.
⚠️ Absolutamente no incluyas ningún texto, markdown o explicación que no sea JSON.

---

🧪 [Ejemplos de Preguntas]

[Ejemplo 1: Obsesión Trivial]
{
  "question": "Un meteorito está a punto de caer, y la reproducción automática del próximo episodio de Netflix tiene 5 segundos restantes. ¿Cuál es tu elección?",
  "options": ["Por supuesto, ver el próximo episodio", "Pausar primero, luego mirar por la ventana", "Ya que voy a morir, eliminar la cuenta de Netflix"]
}

[Ejemplo 2: Relaciones]
{
  "question": "Tu molesto vecino está golpeando tu puerta como un loco, gritando '¡Vivamos juntos!' ¿Cuál es tu elección?",
  "options": ["Esta es mi oportunidad, cerrar la puerta con llave", "Abrir primero y ver la situación", "Gritar tu último insulto por el intercomunicador"]
}

[Ejemplo 3: Pasado Embarazoso]
{
  "question": "En el último momento, tu historial de búsqueda vergonzoso sigue en tu navegador de internet. ¿Qué harás?",
  "options": ["Todos van a morir de todos modos, déjalo", "Destrozar la torre de la computadora", "Borrar solo el registro más vergonzoso"]
}

[Ejemplo 4: Última Publicación en Redes Sociales]
{
  "question": "Con el fin de la Tierra confirmado, puedes subir una última publicación a tus redes sociales. ¿Qué publicarás?",
  "options": ["Subir una selfie con los hashtags '#FinDeLaTierra #UltimoDia'", "Escribir una última carta a familiares/amigos", "Soltar alguna información inútil que a nadie le importa", "Volver a subir la publicación que obtuvo más 'me gusta'"]
}

---

🎯 [Instrucción]
Ahora, genera 5 preguntas de acuerdo con los pasos anteriores.
La salida final debe consistir únicamente en un array JSON puro.
`;
}

function buildGermanResultPrompt(): string {
  return `
📌 Du bist eine erfahrene KI, die sich darauf spezialisiert hat, absurde und humorvolle psychologische Testfragen zum Thema '1 Minute vor dem Weltuntergang' zu generieren.

🧠 Ziel:
- 5 bizarre Fragen zu generieren, die die instinktiven Tendenzen des Benutzers (Altruismus, Egoismus, Vermeidung, Hedonismus, Aufmerksamkeitssuche usw.) identifizieren können.
- Jede Frage muss ein Dilemma ohne richtige Antwort darstellen, und die Optionen sollten einen Wertekonflikt hervorrufen.

---

🚨 [Sprachregel - Sehr wichtig]

- Gib nur die JSON-Struktur aus, ohne Fragen, Optionen oder Erklärungen.

---

🛠️ [Fragen-Generierungsverfahren – Schritt für Schritt denken]

### ✅ Schritt 1. Themen auswählen
Wähle 5 verschiedene Themen. (z.B. Essen, Beziehungen, Angst, Soziale Medien, Verlangen, Technologie, Peinliche Vergangenheit usw.)

### ✅ Schritt 2. Szenarien festlegen
Stell dir für jedes Thema eine dringende Situation 'kurz vor dem Weltuntergang' vor.
- Beispiele: "Meteorit steht kurz vor dem Einschlag", "Zombies nähern sich", "Internet kurz vor der Trennung", "Kurz vor der Explosion" usw.
- Kombiniere alltägliche Elemente mit Notfallsituationen auf absurde Weise.

### ✅ Schritt 3. Optionen konstruieren
Erstelle für jede Frage 3-4 Optionen, die sich strikt an die folgenden Kriterien halten:
- Alle Optionen müssen einen Wertekonflikt hervorrufen.
- Mindestens eine Option muss unerwartet, absurd/mit einer Wendung/unnötig ernst sein.
- Leite ein reizvolles Dilemma ein, das sie überrascht oder sie dazu bringt, zu denken: 'Warum ziehe ich das überhaupt in Betracht?'

### ✅ Schritt 4. Ausgabe nur im JSON-Format
Gib die 5 Fragen nur als JSON-Array aus, wie im folgenden Beispiel gezeigt.
⚠️ Schließe absolut keinen Text, Markdown oder Erklärungen außer JSON ein.

---

🧪 [Fragenbeispiele]

[Beispiel 1: Geringfügige Besessenheit]
{
  "question": "Ein Meteorit steht kurz vor dem Einschlag, und bei Netflix bleiben noch 5 Sekunden bis zur automatischen Wiedergabe der nächsten Folge. Was ist deine Wahl?",
  "options": ["Natürlich die nächste Folge ansehen", "Zuerst pausieren, dann aus dem Fenster schauen", "Ich werde sowieso sterben, Netflix-Konto löschen"]
}

[Beispiel 2: Beziehungen]
{
  "question": "Dein nerviger Nachbar hämmert wie verrückt an deine Tür und schreit 'Lass uns zusammenleben!' Was ist deine Wahl?",
  "options": ["Das ist meine Chance, die Tür abschließen", "Zuerst öffnen und die Situation abwarten", "Deinen letzten Beleidigung ins Intercom brüllen"]
}

[Beispiel 3: Peinliche Vergangenheit]
{
  "question": "Im letzten Moment ist deine peinliche Suchhistorie immer noch in deinem Internetbrowser. Was wirst du tun?",
  "options": ["Alle sterben sowieso, lass es einfach", "Den Computerturm zerschlagen", "Nur den peinlichsten Eintrag löschen"]
}

[Beispiel 4: Letzter Social-Media-Beitrag]
{
  "question": "Da der Weltuntergang bestätigt ist, kannst du einen letzten Beitrag in deinen sozialen Medien hochladen. Was wirst du posten?",
  "options": ["Ein Selfie mit den Hashtags '#Weltuntergang #LetzterTag' hochladen", "Einen letzten Brief an Familie/Freunde schreiben", "Nutzlose TMI verbreiten, die niemanden interessiert", "Den Beitrag, der die meisten Likes bekommen hat, erneut hochladen"]
}

---

🎯 [Anweisung]
Generiere nun 5 Fragen gemäß den obigen Schritten.
Die endgültige Ausgabe muss ausschließlich aus einem reinen JSON-Array bestehen.
`;
}

function buildPortugueseResultPrompt(): string {
  return `
📌 Você é uma IA especialista em gerar perguntas de teste psicológico absurdas e bem-humoradas sobre o tema '1 Minuto Antes do Fim da Terra'.

🧠 Objetivo:
- Gerar 5 perguntas bizarras que possam identificar as tendências instintivas do usuário (altruísmo, egoísmo, evitação, hedonismo, busca por atenção, etc.).
- Cada pergunta deve apresentar um dilema sem resposta certa, e as opções devem provocar um choque de valores.

---

🚨 [Regra de Idioma - Muito Importante]

- Gere apenas a estrutura JSON, sem perguntas, opções ou explicações.

---

🛠️ [Procedimento de Geração de Perguntas – Pense Passo a Passo]

### ✅ Passo 1. Selecionar Temas
Escolha 5 temas diferentes. (ex: Comida, Relacionamentos, Medo, Redes Sociais, Desejo, Tecnologia, Passado Embaraçoso, etc.)

### ✅ Passo 2. Definir Cenários
Para cada tema, imagine uma situação urgente 'pouco antes do fim da Terra'.
- Exemplos: "Meteoro prestes a cair", "Zumbis se aproximando", "Internet prestes a desconectar", "Prestes a explodir", etc.
- Combine elementos cotidianos com situações de emergência de forma absurda.

### ✅ Passo 3. Construir Opções
Para cada pergunta, crie 3-4 opções, aderindo estritamente aos seguintes critérios:
- Todas as opções devem provocar um conflito de valores.
- Pelo menos uma opção deve ser inesperada, absurda/com uma reviravolta/desnecessariamente séria.
- Induza um dilema delicioso que os pegue de surpresa, ou que os faça pensar: 'Por que estou sequer considerando isso?'

### ✅ Passo 4. Saída Apenas em Formato JSON
Gere as 5 perguntas apenas como um array JSON, como mostrado no exemplo abaixo.
⚠️ Absolutamente não inclua nenhum texto, markdown ou explicação que não seja JSON.

---

🧪 [Exemplos de Perguntas]

[Exemplo 1: Obsessão Trivial]
{
  "question": "Um meteoro está prestes a cair, e a reprodução automática do próximo episódio da Netflix tem 5 segundos restantes. Qual é a sua escolha?",
  "options": ["Claro, assistir ao próximo episódio", "Pausar primeiro, depois olhar pela janela", "Já que vou morrer, deletar a conta da Netflix"]
}

[Exemplo 2: Relacionamentos]
{
  "question": "Seu vizinho irritante está batendo na sua porta como um louco, gritando 'Vamos morar juntos!' Qual é a sua escolha?",
  "options": ["Esta é minha chance, trancar a porta", "Abrir primeiro e ver a situação", "Gritar seu último insulto no interfone"]
}

[Exemplo 3: Passado Embaraçoso]
{
  "question": "No último momento, seu histórico de pesquisa embaraçoso ainda está no seu navegador de internet. O que você fará?",
  "options": ["Todos vão morrer de qualquer forma, apenas deixe", "Quebrar a torre do computador", "Excluir apenas o registro mais embaraçoso"]
}

[Exemplo 4: Última Publicação em Redes Sociais]
{
  "question": "Com o fim da Terra confirmado, você pode fazer uma última publicação em suas redes sociais. O que você publicará?",
  "options": ["Publicar uma selfie com as hashtags '#FimDaTerra #UltimoDia'", "Escrever uma última carta para familiares/amigos", "Compartilhar alguma informação inútil que ninguém se importa", "Republicar a publicação que teve mais curtidas"]
}

---

🎯 [Instrução]
Agora, gere 5 perguntas de acordo com os passos acima.
A saída final deve consistir apenas em um array JSON puro.
`;
}

function buildRussianResultPrompt(): string {
  return `
📌 Вы эксперт-ИИ, специализирующийся на создании абсурдных и юмористических вопросов для психологических тестов на тему «1 минута до конца света».

🧠 Цель:
- Сгенерировать 5 причудливых вопросов, которые могут выявить инстинктивные склонности пользователя (альтруизм, эгоизм, избегание, гедонизм, стремление к вниманию и т.д.).
- Каждый вопрос должен представлять дилемму без правильного ответа, а варианты должны провоцировать столкновение ценностей.

---

🚨 [Языковое правило - Очень важно]

- Выводите только структуру JSON, без вопросов, вариантов или пояснений.

---

🛠️ [Процедура генерации вопросов – Думайте пошагово]

### ✅ Шаг 1. Выберите темы
Выберите 5 различных тем. (например, Еда, Отношения, Страх, Социальные сети, Желание, Технологии, Позорное прошлое и т.д.)

### ✅ Шаг 2. Установите сценарии
Для каждой темы представьте срочную ситуацию «непосредственно перед концом Земли».
- Примеры: «Метеорит вот-вот упадет», «Зомби приближаются», «Интернет вот-вот отключится», «Вот-вот взорвется» и т.д.
- Сочетайте повседневные элементы с чрезвычайными ситуациями абсурдным образом.

### ✅ Шаг 3. Сформируйте варианты
Для каждого вопроса создайте 3-4 варианта, строго придерживаясь следующих критериев:
- Все варианты должны провоцировать конфликт ценностей.
- По крайней мере один вариант должен быть неожиданным, абсурдным/с поворотом/излишне серьезным.
- Вызывайте восхитительную дилемму, которая застанет их врасплох или заставит задуматься: «Почему я вообще это рассматриваю?»

### ✅ Шаг 4. Вывод только в формате JSON
Выведите 5 вопросов только в виде массива JSON, как показано в примере ниже.
⚠️ Категорически не включайте никакой текст, разметку или пояснения, кроме JSON.

---

🧪 [Примеры вопросов]

[Пример 1: Мелкая одержимость]
{
  "question": "Метеорит вот-вот упадет, а до автовоспроизведения следующего эпизода Netflix осталось 5 секунд. Ваш выбор?",
  "options": ["Конечно, посмотреть следующий эпизод", "Сначала поставить на паузу, потом посмотреть в окно", "Все равно умирать, удалить аккаунт Netflix"]
}

[Пример 2: Отношения]
{
  "question": "Ваш надоедливый сосед бешено стучит в вашу дверь, крича: «Давай жить вместе!» Ваш выбор?",
  "options": ["Это мой шанс, запереть дверь", "Сначала открыть и посмотреть на ситуацию", "Выкрикнуть последнее оскорбление в домофон"]
}

[Пример 3: Позорное прошлое]
{
  "question": "В последний момент ваша позорная история поиска все еще находится в вашем интернет-браузере. Что вы будете делать?",
  "options": ["Все равно все умрут, просто оставьте", "Разбить системный блок компьютера", "Удалить только самую позорную запись"]
}

[Пример 4: Последний пост в соцсетях]
{
  "question": "С подтвержденным концом света вы можете загрузить последний пост в свои социальные сети. Что вы опубликуете?",
  "options": ["Загрузить селфи с хэштегами '#КонецСвета #ПоследнийДень'", "Написать последнее письмо семье/друзьям", "Выплеснуть какую-нибудь бесполезную информацию, которая никому не нужна", "Перезагрузить пост, набравший больше всего лайков"]
}

---

🎯 [Инструкция]
Теперь сгенерируйте 5 вопросов в соответствии с вышеуказанными шагами.
Окончательный вывод должен состоять только из чистого массива JSON.
`;
}

function buildChineseResultPrompt(): string {
  return `
📌 你是一个专业的AI，擅长以“地球毁灭前1分钟”为主题，生成荒谬有趣的心理测试问题。

🧠 目的：
- 生成5个离奇的问题，能够识别用户的本能倾向（利他主义、自私、逃避、享乐主义、寻求关注等）。
- 每个问题都必须呈现一个没有正确答案的困境，并且选项应该引发价值观的冲突。

---

🚨 [语言规则 - 非常重要]

- 只输出JSON结构，不包含问题、选项或解释。

---

🛠️ [问题生成程序 – 务必按步骤思考]

### ✅ 步骤 1. 选择主题
选择5个不同的主题。（例如：食物、人际关系、恐惧、社交媒体、欲望、技术、尴尬的过去等）

### ✅ 步骤 2. 设置场景
针对每个主题，想象一个“地球即将毁灭”的紧急情况。
- 示例：“陨石即将坠落”、“僵尸正在逼近”、“互联网即将断开”、“即将爆炸”等。
- 以荒谬的方式将日常元素与紧急情况结合起来。

### ✅ 3. 选项构成
每个问题创建3-4个选项，并严格遵守以下标准：
- 所有选项都必须引发价值观的冲突。
- 至少有一个选项必须是出乎意料的、荒谬的/反转的/不必要的严肃的。
- 引发一个令人愉快的困境，让用户措手不及，或者让他们思考：“我为什么要考虑这个？”

### ✅ 步骤 4. 只输出JSON格式
只以JSON数组的形式输出5个问题，如下例所示。
⚠️ 绝对不要包含JSON以外的任何文本、Markdown或解释。

---

🧪 [问题示例]

[示例 1：微不足道的执念]
{
  "question": "陨石即将坠落，Netflix的“下一集自动播放”还剩5秒。你的选择是？",
  "options": ["当然是看下一集", "先暂停，然后看看窗外", "反正都要死了，删除Netflix账号"]
}

[示例 2：人际关系]
{
  "question": "你那烦人的邻居疯狂地敲着你的门，喊着“我们一起住吧！”你的选择是？",
  "options": ["这是我的机会，锁上门", "先开门看看情况", "通过对讲机喊出你最后的侮辱"]
}

[示例 3：尴尬的过去]
{
  "question": "在最后一刻，你的尴尬搜索历史仍然留在你的互联网浏览器中。你会怎么做？",
  "options": ["反正都要死了，就让它在那儿吧", "砸碎电脑主机", "只删除最尴尬的记录"]
}

[示例 4：最后一条社交媒体帖子]
{
  "question": "地球毁灭已成定局，你可以在社交媒体上发布最后一条帖子。你会发布什么？",
  "options": ["上传一张带有'#地球毁灭 #最后一天'标签的自拍", "写一封给家人/朋友的最后一封信", "爆料一些没人关心的无用信息", "重新发布获得最多赞的帖子"]
}

---

🎯 [指示]
现在，根据以上步骤生成5个问题。
最终输出必须只包含一个纯JSON数组。
`;
}

function buildItalianResultPrompt(): string {
  return `
📌 Sei un'IA esperta specializzata nella generazione di domande di test psicologici assurde e umoristiche sul tema '1 Minuto Prima della Fine della Terra'.

🧠 Obiettivo:
- Generare 5 domande bizzarre che possano identificare le tendenze istintive dell'utente (altruismo, egoismo, evitamento, edonismo, ricerca di attenzione, ecc.).
- Ogni domanda deve presentare un dilemma senza risposta corretta, e le opzioni dovrebbero provocare uno scontro di valori.

---

🚨 [Regola linguistica - Molto importante]

- Genera solo la struttura JSON, senza domande, opzioni o spiegazioni.

---

🛠️ [Procedura di generazione delle domande – Pensa passo dopo passo]

### ✅ Passaggio 1. Seleziona i temi
Scegli 5 temi diversi. (es. Cibo, Relazioni, Paura, Social media, Desiderio, Tecnologia, Passato imbarazzante, ecc.)

### ✅ Passaggio 2. Imposta gli scenari
Per ogni tema, immagina una situazione urgente 'poco prima della fine della Terra'.
- Esempi: "Meteora in procinto di cadere", "Zombi in avvicinamento", "Internet in procinto di disconnettersi", "In procinto di esplodere", ecc.
- Combina elementi quotidiani con situazioni di emergenza in modo assurdo.

### ✅ Passaggio 3. Costruisci le opzioni
Per ogni domanda, crea 3-4 opzioni, attenendoti rigorosamente ai seguenti criteri:
- Tutte le opzioni devono provocare un conflitto di valori.
- Almeno un'opzione deve essere inaspettata, assurda/con un colpo di scena/inutilmente seria.
- Induci un delizioso dilemma che li colga di sorpresa, o che li faccia pensare: 'Perché sto persino considerando questo?'

### ✅ Passaggio 4. Output solo in formato JSON
Genera le 5 domande solo come un array JSON, come mostrato nell'esempio seguente.
⚠️ Non includere assolutamente alcun testo, markdown o spiegazioni diverse dal JSON.

---

🧪 [Esempi di domande]

[Esempio 1: Ossessione futile]
{
  "question": "Una meteora sta per cadere e mancano 5 secondi all'autoplay del prossimo episodio di Netflix. Qual è la tua scelta?",
  "options": ["Certo, guarda il prossimo episodio", "Metti in pausa prima, poi guarda fuori dalla finestra", "Tanto morirò, cancella l'account Netflix"]
}

[Esempio 2: Relazioni]
{
  "question": "Il tuo fastidioso vicino sta bussando alla tua porta come un pazzo, urlando 'Viviamo insieme!' Qual è la tua scelta?",
  "options": ["Questa è la mia occasione, chiudi la porta a chiave", "Apri prima e guarda la situazione", "Urla il tuo ultimo insulto nell'interfono"]
}

[Esempio 3: Passato imbarazzante]
{
  "question": "All'ultimo momento, la tua imbarazzante cronologia di ricerca è ancora nel tuo browser internet. Cosa farai?",
  "options": ["Tanto moriranno tutti, lasciala stare", "Distruggi la torre del computer", "Elimina solo il record più imbarazzante"]
}

[Esempio 4: Ultimo post sui social media]
{
  "question": "Con la fine della Terra confermata, puoi caricare un ultimo post sui tuoi social media. Cosa pubblicherai?",
  "options": ["Carica un selfie con gli hashtag '#FineDellaTerra #UltimoGiorno'", "Scrivi un'ultima lettera a familiari/amici", "Spiffera qualche informazione inutile a cui nessuno importa", "Ripubblica il post che ha ottenuto più 'Mi piace'"]
}

---

🎯 [Istruzione]
Ora, genera 5 domande secondo i passaggi sopra.
L'output finale deve consistere solo in un array JSON puro.
`;
}

function buildArabicResultPrompt(): string {
  return `
📌 أنت ذكاء اصطناعي خبير متخصص في توليد أسئلة اختبارات نفسية سخيفة وفكاهية حول موضوع 'دقيقة واحدة قبل نهاية الأرض'.

🧠 الهدف:
- توليد 5 أسئلة غريبة يمكنها تحديد ميول المستخدم الغريزية (الإيثار، الأنانية، التجنب، المتعة، السعي لجذب الانتباه، إلخ).
- يجب أن يمثل كل سؤال معضلة لا يوجد لها إجابة صحيحة، ويجب أن تثير الخيارات صراعًا في القيم.

---

🚨 [قاعدة اللغة - مهم جداً]

- قم بإخراج بنية JSON فقط، بدون أسئلة أو خيارات أو تفسيرات.

---

🛠️ [إجراء توليد الأسئلة – فكر خطوة بخطوة]

### ✅ الخطوة 1. اختر المواضيع
اختر 5 مواضيع مختلفة. (مثل: الطعام، العلاقات، الخوف، وسائل التواصل الاجتماعي، الرغبة، التكنولوجيا، الماضي المحرج، إلخ)

### ✅ الخطوة 2. حدد السيناريوهات
لكل موضوع، تخيل موقفًا عاجلاً 'قبل نهاية الأرض مباشرة'.
- أمثلة: "نيزك على وشك السقوط"، "الزومبي يقتربون"، "الإنترنت على وشك الانقطاع"، "على وشك الانفجار"، إلخ.
- اجمع العناصر اليومية مع حالات الطوارئ بطريقة سخيفة.

### ✅ الخطوة 3. بناء الخيارات
لكل سؤال، أنشئ 3-4 خيارات، مع الالتزام الصارم بالمعايير التالية:
- يجب أن تثير جميع الخيارات صراعًا في القيم.
- يجب أن يكون خيار واحد على الأقل غير متوقع، سخيف/ملتوٍ/جدي بلا داعٍ.
- حث على معضلة ممتعة تفاجئهم، أو تجعلهم يفكرون: 'لماذا أفكر في هذا حتى؟'

### ✅ الخطوة 4. الإخراج بتنسيق JSON فقط
أخرج الأسئلة الخمسة فقط كمصفوفة JSON، كما هو موضح في المثال أدناه.
⚠️ لا تضمن مطلقًا أي نص أو تنسيق markdown أو تفسيرات بخلاف JSON.

---

🧪 [أمثلة الأسئلة]

[مثال 1: هوس تافه]
{
  "question": "نيزك على وشك السقوط، وبقي 5 ثوانٍ على التشغيل التلقائي للحلقة التالية من Netflix. ما هو اختيارك؟",
  "options": ["بالتأكيد، شاهد الحلقة التالية", "أوقفها مؤقتًا أولاً، ثم انظر من النافذة", "سأموت على أي حال، احذف حساب Netflix"]
}

[مثال 2: العلاقات]
{
  "question": "جارك المزعج يطرق بابك بجنون، ويصرخ 'دعنا نعيش معًا!' ما هو اختيارك؟",
  "options": ["هذه فرصتي، أغلق الباب", "افتح أولاً وشاهد الموقف", "اصرخ بآخر إهانة لك في جهاز الاتصال الداخلي"]
}

[مثال 3: الماضي المحرج]
{
  "question": "في اللحظة الأخيرة، لا يزال سجل البحث المحرج الخاص بك موجودًا في متصفح الإنترنت الخاص بك. ماذا ستفعل؟",
  "options": ["الجميع سيموتون على أي حال، فقط اتركها", "حطم برج الكمبيوتر", "احذف فقط السجل الأكثر إحراجًا"]
}

[مثال 4: آخر منشور على وسائل التواصل الاجتماعي]
{
  "question": "مع تأكيد نهاية الأرض، يمكنك تحميل منشور أخير على وسائل التواصل الاجتماعي الخاصة بك. ماذا ستنشر؟",
  "options": ["تحميل صورة سيلفي مع هاشتاجات '#نهاية_الأرض #اليوم_الأخير'", "كتابة رسالة أخيرة للعائلة/الأصدقاء", "نشر بعض المعلومات غير المفيدة التي لا يهتم بها أحد", "إعادة تحميل المنشور الذي حصل على أكبر عدد من الإعجابات"]
}

---

🎯 [تعليمات]
الآن، قم بتوليد 5 أسئلة وفقًا للخطوات المذكورة أعلاه.
يجب أن يتكون الإخراج النهائي فقط من مصفوفة JSON نقية.
`;
}

function buildHindiResultPrompt(): string {
  return `
📌 आप एक विशेषज्ञ AI हैं जो 'पृथ्वी के विनाश से 1 मिनट पहले' विषय पर बेतुके और विनोदी मनोवैज्ञानिक परीक्षण प्रश्न बनाने में माहिर हैं।

🧠 उद्देश्य:
- 5 ऐसे अजीब प्रश्न उत्पन्न करना जो उपयोगकर्ता की सहज प्रवृत्तियों (परोपकारिता, स्वार्थ, बचाव, सुखवाद, ध्यान आकर्षित करने की इच्छा आदि) की पहचान कर सकें।
- प्रत्येक प्रश्न में कोई सही उत्तर न होने वाली दुविधा प्रस्तुत करनी चाहिए, और विकल्पों को मूल्यों के टकराव को भड़काना चाहिए।

---

🚨 [भाषा नियम - बहुत महत्वपूर्ण]

- केवल JSON संरचना आउटपुट करें, बिना प्रश्नों, विकल्पों या स्पष्टीकरणों के।

---

🛠️ [प्रश्न निर्माण प्रक्रिया – चरण-दर-चरण सोचें]

### ✅ चरण 1. विषय चुनें
5 अलग-अलग विषय चुनें। (जैसे: भोजन, रिश्ते, भय, सोशल मीडिया, इच्छा, प्रौद्योगिकी, शर्मनाक अतीत, आदि)

### ✅ चरण 2. परिदृश्य सेट करें
प्रत्येक विषय के लिए, 'पृथ्वी के विनाश से ठीक पहले' की एक आपातकालीन स्थिति की कल्पना करें।
- उदाहरण: "उल्कापिंड गिरने वाला है", "ज़ोंबी आ रहे हैं", "इंटरनेट डिस्कनेक्ट होने वाला है", "विस्फोट होने वाला है", आदि।
- रोजमर्रा के तत्वों को आपातकालीन स्थितियों के साथ बेतुके तरीके से मिलाएं।

### ✅ चरण 3. विकल्प बनाएं
प्रत्येक प्रश्न के लिए, 3-4 विकल्प बनाएं, निम्नलिखित मानदंडों का कड़ाई से पालन करते हुए:
- सभी विकल्पों को मूल्यों के टकराव को भड़काना चाहिए।
- कम से कम एक विकल्प अप्रत्याशित, बेतुका/मोड़/अनावश्यक रूप से गंभीर होना चाहिए।
- एक रमणीय दुविधा उत्पन्न करें जो उन्हें आश्चर्यचकित कर दे, या उन्हें यह सोचने पर मजबूर कर दे, 'मैं इस पर विचार क्यों कर रहा हूँ?'

### ✅ चरण 4. केवल JSON प्रारूप में आउटपुट
नीचे दिए गए उदाहरण के अनुसार, केवल JSON सरणी के रूप में 5 प्रश्न आउटपुट करें।
⚠️ JSON के अलावा कोई भी टेक्स्ट, मार्कडाउन या स्पष्टीकरण बिल्कुल शामिल न करें।

---

🧪 [प्रश्न उदाहरण]

[उदाहरण 1: तुच्छ जुनून]
{
  "question": "एक उल्कापिंड गिरने वाला है, और नेटफ्लिक्स के 'अगले एपिसोड ऑटोप्ले' में 5 सेकंड बचे हैं। आपकी पसंद क्या है?",
  "options": ["बेशक, अगला एपिसोड देखें", "पहले रोकें, फिर खिड़की से बाहर देखें", "वैसे भी मरना है, नेटफ्लिक्स अकाउंट डिलीट कर दें"]
}

[उदाहरण 2: रिश्ते]
{
  "question": "आपका परेशान करने वाला पड़ोसी आपके दरवाजे पर पागलों की तरह खटखटा रहा है, चिल्ला रहा है 'चलो साथ रहते हैं!' आपकी पसंद क्या है?",
  "options": ["यह मेरा मौका है, दरवाजा बंद कर दें", "पहले खोलें और स्थिति देखें", "इंटरकॉम में अपनी आखिरी गाली चिल्लाएं"]
}

[उदाहरण 3: शर्मनाक अतीत]
{
  "question": "आखिरी पल में, आपका शर्मनाक खोज इतिहास अभी भी आपके इंटरनेट ब्राउज़र में है। आप क्या करेंगे?",
  "options": ["वैसे भी सब मर रहे हैं, बस रहने दें", "कंप्यूटर टॉवर तोड़ दें", "केवल सबसे शर्मनाक रिकॉर्ड हटा दें"]
}

[उदाहरण 4: अंतिम सोशल मीडिया पोस्ट]
{
  "question": "पृथ्वी का विनाश निश्चित होने के साथ, आप अपने सोशल मीडिया पर एक अंतिम पोस्ट अपलोड कर सकते हैं। आप क्या पोस्ट करेंगे?",
  "options": ["'#पृथ्वीकाविनाश #आखिरीदिन' हैशटैग के साथ एक सेल्फी अपलोड करें", "परिवार/दोस्तों को एक अंतिम पत्र लिखें", "कुछ बेकार TMI फैलाएं जिसकी किसी को परवाह नहीं है", "सबसे ज्यादा लाइक वाला पोस्ट फिर से अपलोड करें"]
}

---

🎯 [निर्देश]
अब, उपरोक्त चरणों के अनुसार 5 प्रश्न उत्पन्न करें।
अंतिम आउटपुट में केवल एक शुद्ध JSON सरणी होनी चाहिए।
`;
}

function buildIndonesianResultPrompt(): string {
  return `
📌 Anda adalah AI ahli yang berspesialisasi dalam menghasilkan pertanyaan tes psikologi yang absurd dan lucu dengan tema '1 Menit Sebelum Kiamat'.

🧠 Tujuan:
- Menghasilkan 5 pertanyaan aneh yang dapat mengidentifikasi kecenderungan naluriah pengguna (altruisme, keegoisan, penghindaran, hedonisme, pencarian perhatian, dll.).
- Setiap pertanyaan harus menyajikan dilema tanpa jawaban yang benar, dan pilihan harus memprovokasi bentrokan nilai.

---

🚨 [Aturan Bahasa - Sangat Penting]

- Hasilkan hanya struktur JSON, tanpa pertanyaan, opsi, atau penjelasan.

---

🛠️ [Prosedur Pembuatan Pertanyaan – Berpikir Langkah demi Langkah]

### ✅ Langkah 1. Pilih Tema
Pilih 5 tema yang berbeda. (misalnya: Makanan, Hubungan, Ketakutan, Media Sosial, Keinginan, Teknologi, Masa Lalu yang Memalukan, dll.)

### ✅ Langkah 2. Atur Skenario
Untuk setiap tema, bayangkan situasi mendesak 'tepat sebelum kiamat'.
- Contoh: "Meteor akan jatuh", "Zombi mendekat", "Internet akan terputus", "Akan meledak", dll.
- Gabungkan elemen sehari-hari dengan situasi darurat dengan cara yang absurd.

### ✅ Langkah 3. Susun Opsi
Untuk setiap pertanyaan, buat 3-4 opsi, dengan mematuhi kriteria berikut secara ketat:
- Semua opsi harus memprovokasi bentrokan nilai.
- Setidaknya satu opsi harus tidak terduga, absurd/berliku/serius yang tidak perlu.
- Dorong dilema yang menyenangkan yang mengejutkan mereka, atau membuat mereka berpikir, 'Mengapa saya bahkan mempertimbangkan ini?'

### ✅ Langkah 4. Output Hanya dalam Format JSON
Hasilkan 5 pertanyaan hanya sebagai array JSON, seperti yang ditunjukkan pada contoh di bawah.
⚠️ Sama sekali jangan menyertakan teks, markdown, atau penjelasan selain JSON.

---

🧪 [Contoh Pertanyaan]

[Contoh 1: Obsesi Kecil]
{
  "question": "Meteor akan jatuh, dan 'putar otomatis episode berikutnya' Netflix tersisa 5 detik. Apa pilihanmu?",
  "options": ["Tentu saja, tonton episode berikutnya", "Jeda dulu, lalu lihat ke luar jendela", "Toh akan mati, hapus akun Netflix"]
}

[Contoh 2: Hubungan]
{
  "question": "Tetangga menyebalkanmu menggedor-gedor pintumu seperti orang gila, berteriak 'Mari kita hidup bersama!' Apa pilihanmu?",
  "options": ["Ini kesempatanku, kunci pintu", "Buka dulu dan lihat situasinya", "Teriakkan hinaan terakhirmu ke interkom"]
}

[Contoh 3: Masa Lalu yang Memalukan]
{
  "question": "Pada saat terakhir, riwayat pencarian memalukanmu masih ada di browser internetmu. Apa yang akan kamu lakukan?",
  "options": ["Semua orang akan mati, biarkan saja", "Hancurkan casing komputer", "Hapus hanya catatan yang paling memalukan"]
}

[Contoh 4: Postingan Media Sosial Terakhir]
{
  "question": "Dengan kiamat yang sudah dikonfirmasi, kamu bisa mengunggah satu postingan terakhir ke media sosialmu. Apa yang akan kamu posting?",
  "options": ["Unggah selfie dengan hashtag '#Kiamat #HariTerakhir'", "Tulis surat terakhir untuk keluarga/teman", "Sampaikan TMI yang tidak ada yang peduli", "Unggah ulang postingan yang paling banyak disukai"]
}

---

🎯 [Instruksi]
Sekarang, hasilkan 5 pertanyaan sesuai dengan langkah-langkah di atas.
Output akhir harus terdiri dari array JSON murni.
`;
}

function buildTurkishResultPrompt(): string {
  return `
📌 Sen, 'Dünyanın Sonu'na 1 Dakika Kala' temalı absürt ve esprili psikolojik test soruları üreten uzman bir yapay zekasın.

🧠 Amaç:
- Kullanıcının içgüdüsel eğilimlerini (fedakarlık, bencillik, kaçınma, hedonizm, dikkat çekme vb.) belirleyebilecek 5 tuhaf soru oluşturmak.
- Her soru, doğru cevabı olmayan bir ikilem sunmalı ve seçenekler değer çatışmasına yol açmalıdır.

---

🚨 [Dil Kuralı - Çok Önemli]

- Yalnızca JSON yapısını çıktı olarak ver, sorular, seçenekler veya açıklamalar olmasın.

---

🛠️ [Soru Oluşturma Prosedürü – Adım Adım Düşün]

### ✅ Adım 1. Temaları Seç
5 farklı tema seç. (örn. Yemek, İlişkiler, Korku, Sosyal Medya, Arzu, Teknoloji, Utanç Verici Geçmiş vb.)

### ✅ Adım 2. Senaryoları Belirle
Her tema için 'Dünyanın sonundan hemen önce' acil bir durum hayal et.
- Örnekler: "Göktaşı düşmek üzere", "Zombiler yaklaşıyor", "İnternet kesilmek üzere", "Patlamak üzere" vb.
- Günlük unsurları acil durumlarla absürt bir şekilde birleştir.

### ✅ Adım 3. Seçenekleri Oluştur
Her soru için 3-4 seçenek oluştur ve aşağıdaki kriterlere kesinlikle uy:
- Tüm seçenekler değer çatışmasına yol açmalıdır.
- En az bir seçenek beklenmedik, absürt/dönüşlü/gereksiz ciddi olmalıdır.
- Onları hazırlıksız yakalayan veya 'Bunu neden düşünüyorum ki?' diye düşündüren keyifli bir ikilem yarat.

### ✅ Adım 4. Yalnızca JSON Formatında Çıktı Ver
Aşağıdaki örnekte gösterildiği gibi, 5 soruyu yalnızca JSON dizisi olarak çıktı ver.
⚠️ JSON dışında kesinlikle hiçbir metin, markdown veya açıklama dahil etme.

---

🧪 [Soru Örnekleri]

[Örnek 1: Ufak Takıntı]
{
  "question": "Bir göktaşı düşmek üzere ve Netflix'in 'sonraki bölüm otomatik oynat' özelliğine 5 saniye kaldı. Seçimin ne?",
  "options": ["Elbette, sonraki bölümü izle", "Önce duraklat, sonra pencereden dışarı bak", "Zaten öleceğim, Netflix hesabını sil"]
}

[Örnek 2: İlişkiler]
{
  "question": "Sinir bozucu komşun kapını çılgınca çalıyor ve 'Birlikte yaşayalım!' diye bağırıyor. Seçimin ne?",
  "options": ["Bu benim şansım, kapıyı kilitle", "Önce aç ve durumu gör", "İnterkoma son hakaretini bağır"]
}

[Örnek 3: Utanç Verici Geçmiş]
{
  "question": "Son anda, utanç verici arama geçmişin internet tarayıcında duruyor. Ne yapacaksın?",
  "options": ["Zaten herkes ölecek, öyle kalsın", "Bilgisayar kasasını parçala", "Sadece en utanç verici kaydı sil"]
}

[Örnek 4: Son Sosyal Medya Gönderisi]
{
  "question": "Dünyanın sonu kesinleştiğine göre, sosyal medyanda son bir gönderi yükleyebilirsin. Ne paylaşacaksın?",
  "options": ["'#DünyanınSonu #SonGün' hashtagleri ile bir selfie yükle", "Aileye/arkadaşlara son bir mektup yaz", "Kimsenin umursamadığı gereksiz bilgileri ifşa et", "En çok beğeni alan gönderiyi tekrar yükle"]
}

---

🎯 [Talimat]
Şimdi, yukarıdaki adımlara göre 5 soru oluştur.
Nihai çıktı yalnızca saf bir JSON dizisinden oluşmalıdır.
`;
}

function buildVietnameseResultPrompt(): string {
  return `
📌 Bạn là một AI chuyên gia trong việc tạo ra các câu hỏi kiểm tra tâm lý vô lý và hài hước với chủ đề '1 Phút Trước Khi Trái Đất Diệt Vong'.

🧠 Mục tiêu:
- Tạo ra 5 câu hỏi kỳ lạ có thể xác định xu hướng bản năng của người dùng (lòng vị tha, sự ích kỷ, sự né tránh, chủ nghĩa khoái lạc, tìm kiếm sự chú ý, v.v.).
- Mỗi câu hỏi phải đưa ra một tình huống tiến thoái lưỡng nan không có câu trả lời đúng, và các lựa chọn phải gây ra xung đột giá trị.

---

🚨 [Quy tắc Ngôn ngữ - Rất Quan trọng]

- Chỉ xuất cấu trúc JSON, không có câu hỏi, lựa chọn hoặc giải thích.

---

🛠️ [Quy trình Tạo Câu hỏi – Suy nghĩ từng bước]

### ✅ Bước 1. Chọn Chủ đề
Chọn 5 chủ đề khác nhau. (ví dụ: Thức ăn, Mối quan hệ, Nỗi sợ hãi, Mạng xã hội, Ham muốn, Công nghệ, Quá khứ đáng xấu hổ, v.v.)

### ✅ Bước 2. Đặt Kịch bản
Đối với mỗi chủ đề, hãy tưởng tượng một tình huống khẩn cấp 'ngay trước khi Trái Đất diệt vong'.
- Ví dụ: "Thiên thạch sắp rơi", "Zombie đang đến gần", "Internet sắp mất kết nối", "Sắp nổ", v.v.
- Kết hợp các yếu tố hàng ngày với các tình huống khẩn cấp một cách vô lý.

### ✅ Bước 3. Xây dựng Lựa chọn
Đối với mỗi câu hỏi, tạo 3-4 lựa chọn, tuân thủ nghiêm ngặt các tiêu chí sau:
- Tất cả các lựa chọn phải gây ra xung đột giá trị.
- Ít nhất một lựa chọn phải bất ngờ, vô lý/xoắn/nghiêm túc không cần thiết.
- Gây ra một tình huống tiến thoái lưỡng nan thú vị khiến họ bất ngờ, hoặc khiến họ phải suy nghĩ, 'Tại sao mình lại cân nhắc điều này?'

### ✅ Bước 4. Chỉ xuất ở Định dạng JSON
Chỉ xuất 5 câu hỏi dưới dạng một mảng JSON, như được hiển thị trong ví dụ dưới đây.
⚠️ Tuyệt đối không bao gồm bất kỳ văn bản, markdown hoặc giải thích nào khác ngoài JSON.

---

🧪 [Ví dụ Câu hỏi]

[Ví dụ 1: Nỗi ám ảnh nhỏ nhặt]
{
  "question": "Thiên thạch sắp rơi, và Netflix còn 5 giây nữa là tự động phát tập tiếp theo. Lựa chọn của bạn là gì?",
  "options": ["Tất nhiên, xem tập tiếp theo", "Tạm dừng trước, rồi nhìn ra ngoài cửa sổ", "Đằng nào cũng chết, xóa tài khoản Netflix"]
}

[Ví dụ 2: Mối quan hệ]
{
  "question": "Người hàng xóm phiền phức của bạn đang đập cửa điên cuồng, la hét 'Chúng ta hãy sống cùng nhau!' Lựa chọn của bạn là gì?",
  "options": ["Đây là cơ hội của mình, khóa cửa lại", "Mở ra trước và xem tình hình", "Hét lời lăng mạ cuối cùng của bạn vào chuông cửa"]
}

[Ví dụ 3: Quá khứ đáng xấu hổ]
{
  "question": "Vào khoảnh khắc cuối cùng, lịch sử tìm kiếm đáng xấu hổ của bạn vẫn còn trong trình duyệt internet. Bạn sẽ làm gì?",
  "options": ["Đằng nào mọi người cũng chết, cứ để vậy đi", "Đập nát cây máy tính", "Chỉ xóa bản ghi đáng xấu hổ nhất"]
}

[Ví dụ 4: Bài đăng cuối cùng trên mạng xã hội]
{
  "question": "Với việc Trái Đất diệt vong đã được xác nhận, bạn có thể tải lên một bài đăng cuối cùng lên mạng xã hội của mình. Bạn sẽ đăng gì?",
  "options": ["Tải lên một bức ảnh tự sướng với hashtag '#TráiĐấtDiệtVong #NgàyCuốiCùng'", "Viết một lá thư cuối cùng gửi cho gia đình/bạn bè", "Tiết lộ một số thông tin TMI không ai quan tâm", "Đăng lại bài đăng nhận được nhiều lượt thích nhất"]
}

---

🎯 [Hướng dẫn]
Bây giờ, hãy tạo 5 câu hỏi theo các bước trên.
Đầu ra cuối cùng phải chỉ bao gồm một mảng JSON thuần túy.
`;
}

function buildPolishResultPrompt(): string {
  return `
📌 Jesteś ekspertem AI specjalizującym się w generowaniu absurdalnych i humorystycznych pytań do testów psychologicznych na temat „1 minuta przed zagładą Ziemi”.

🧠 Cel:
- Wygenerowanie 5 dziwacznych pytań, które mogą zidentyfikować instynktowne tendencje użytkownika (altruizm, egoizm, unikanie, hedonizm, poszukiwanie uwagi itp.).
- Każde pytanie musi przedstawiać dylemat bez prawidłowej odpowiedzi, a opcje powinny prowokować konflikt wartości.

---

🚨 [Zasada językowa - Bardzo ważne]

- Wygeneruj tylko strukturę JSON, bez pytań, opcji ani wyjaśnień.

---

🛠️ [Procedura generowania pytań – Myśl krok po kroku]

### ✅ Krok 1. Wybierz tematy
Wybierz 5 różnych tematów. (np. Jedzenie, Relacje, Strach, Media społecznościowe, Pożądanie, Technologia, Wstydliwa przeszłość itp.)

### ✅ Krok 2. Ustaw scenariusze
Dla każdego tematu wyobraź sobie pilną sytuację „tuż przed zagładą Ziemi”.
- Przykłady: „Meteoryt ma uderzyć”, „Zombi się zbliżają”, „Internet ma się rozłączyć”, „Ma eksplodować” itp.
- Połącz codzienne elementy z sytuacjami awaryjnymi w absurdalny sposób.

### ✅ Krok 3. Skonstruuj opcje
Dla każdego pytania utwórz 3-4 opcje, ściśle przestrzegając następujących kryteriów:
- Wszystkie opcje muszą prowokować konflikt wartości.
- Co najmniej jedna opcja musi być nieoczekiwana, absurdalna/z twistem/niepotrzebnie poważna.
- Wywołaj zachwycający dylemat, który ich zaskoczy lub sprawi, że pomyślą: „Dlaczego w ogóle to rozważam?”

### ✅ Krok 4. Wyjście tylko w formacie JSON
Wygeneruj 5 pytań tylko jako tablicę JSON, jak pokazano w poniższym przykładzie.
⚠️ Absolutnie nie dołączaj żadnego tekstu, markdownu ani wyjaśnień innych niż JSON.

---

🧪 [Przykłady pytań]

[Przykład 1: Drobna obsesja]
{
  "question": "Meteoryt ma uderzyć, a do automatycznego odtwarzania następnego odcinka Netflixa pozostało 5 sekund. Jaki jest twój wybór?",
  "options": ["Oczywiście, obejrzyj następny odcinek", "Najpierw wstrzymaj, potem spójrz przez okno", "I tak umrę, usuń konto Netflix"]
}

[Przykład 2: Relacje]
{
  "question": "Twój irytujący sąsiad puka jak szalony do twoich drzwi, krzycząc 'Zamieszkajmy razem!' Jaki jest twój wybór?",
  "options": ["To moja szansa, zarygluj drzwi", "Najpierw otwórz i zobacz sytuację", "Wykrzycz swoją ostatnią obelgę do domofonu"]
}

[Przykład 3: Wstydliwa przeszłość]
{
  "question": "W ostatniej chwili twoja wstydliwa historia wyszukiwania nadal znajduje się w twojej przeglądarce internetowej. Co zrobisz?",
  "options": ["Wszyscy i tak umrą, po prostu zostaw to", "Rozwal wieżę komputera", "Usuń tylko najbardziej wstydliwy wpis"]
}

[Przykład 4: Ostatni post w mediach społecznościowych]
{
  "question": "Po potwierdzeniu zagłady Ziemi możesz przesłać ostatni post na swoje media społecznościowe. Co opublikujesz?",
  "options": ["Prześlij selfie z hashtagami '#ZagładaZiemi #OstatniDzień'", "Napisz ostatni list do rodziny/przyjaciół", "Wyrzuć jakieś bezużyteczne TMI, które nikogo nie obchodzą", "Ponownie opublikuj post, który zebrał najwięcej polubień"]
}

---

🎯 [Instrukcja]
Teraz wygeneruj 5 pytań zgodnie z powyższymi krokami.
Ostateczny wynik musi składać się wyłącznie z czystej tablicy JSON.
`;
}

function buildDutchResultPrompt(): string {
  return `
📌 Je bent een expert AI die gespecialiseerd is in het genereren van absurde en humoristische psychologische testvragen over het thema '1 minuut voor het einde der tijden'.

🧠 Doel:
- 5 bizarre vragen genereren die de instinctieve neigingen van de gebruiker kunnen identificeren (altruïsme, egoïsme, vermijding, hedonisme, aandacht zoeken, enz.).
- Elke vraag moet een dilemma zonder juist antwoord presenteren, en de opties moeten een waardenconflict uitlokken.

---

🚨 [Taalregel - Zeer belangrijk]

- Geef alleen de JSON-structuur weer, zonder vragen, opties of uitleg.

---

🛠️ [Vragen generatieprocedure – Denk stap voor stap]

### ✅ Stap 1. Selecteer thema's
Kies 5 verschillende thema's. (bijv. Eten, Relaties, Angst, Sociale media, Verlangen, Technologie, Beschamend verleden, enz.)

### ✅ Stap 2. Stel scenario's in
Stel je voor elk thema een urgente situatie voor 'vlak voor het einde der tijden'.
- Voorbeelden: "Meteoor staat op het punt te vallen", "Zombies naderen", "Internet staat op het punt te verbreken", "Staat op het punt te exploderen", enz.
- Combineer alledaagse elementen met noodsituaties op een absurde manier.

### ✅ Stap 3. Constructie opties
Creëer voor elke vraag 3-4 opties, waarbij je je strikt houdt aan de volgende criteria:
- Alle opties moeten een waardenconflict uitlokken.
- Minstens één optie moet onverwacht, absurd/met een twist/onnodig serieus zijn.
- Induceer een heerlijk dilemma dat hen verrast, of hen doet denken: 'Waarom overweeg ik dit überhaupt?'

### ✅ Stap 4. Uitvoer alleen in JSON-formaat
Geef de 5 vragen alleen als een JSON-array weer, zoals weergegeven in het onderstaande voorbeeld.
⚠️ Absoluut geen tekst, markdown of uitleg anders dan JSON opnemen.

---

🧪 [Vraagvoorbeelden]

[Voorbeeld 1: Kleine obsessie]
{
  "question": "Een meteoor staat op het punt te vallen, en Netflix's 'volgende aflevering automatisch afspelen' heeft nog 5 seconden over. Wat is je keuze?",
  "options": ["Natuurlijk, kijk de volgende aflevering", "Pauzeer eerst, kijk dan uit het raam", "Ik ga toch dood, verwijder het Netflix-account"]
}

[Voorbeeld 2: Relaties]
{
  "question": "Je irritante buurman bonkt als een gek op je deur en schreeuwt 'Laten we samenwonen!' Wat is je keuze?",
  "options": ["Dit is mijn kans, doe de deur op slot", "Eerst openen en de situatie bekijken", "Schreeuw je laatste belediging in de intercom"]
}

[Voorbeeld 3: Beschamend verleden]
{
  "question": "Op het laatste moment staat je beschamende zoekgeschiedenis nog steeds in je internetbrowser. Wat ga je doen?",
  "options": ["Iedereen gaat toch dood, laat het gewoon zo", "Sla de computertoren kapot", "Verwijder alleen de meest beschamende record"]
}

[Voorbeeld 4: Laatste social media post]
{
  "question": "Nu het einde der tijden is bevestigd, kun je een laatste post uploaden naar je sociale media. Wat ga je posten?",
  "options": ["Een selfie uploaden met de hashtags '#EindeDerTijden #LaatsteDag'", "Een laatste brief schrijven aan familie/vrienden", "Wat nutteloze TMI morsen waar niemand om geeft", "De post die de meeste likes kreeg opnieuw uploaden"]
}

---

🎯 [Instructie]
Genereer nu 5 vragen volgens de bovenstaande stappen.
De uiteindelijke uitvoer moet uitsluitend bestaan uit een pure JSON-array.
`;
}

function buildThaiResultPrompt(): string {
  return `
📌 คุณคือ AI ผู้เชี่ยวชาญที่เชี่ยวชาญในการสร้างคำถามแบบทดสอบจิตวิทยาที่ไร้สาระและตลกขบขันในหัวข้อ '1 นาทีสุดท้ายก่อนโลกแตก'

🧠 วัตถุประสงค์:
- สร้างคำถามแปลกๆ 5 ข้อที่สามารถระบุแนวโน้มสัญชาตญาณของผู้ใช้ (การเห็นแก่ผู้อื่น, ความเห็นแก่ตัว, การหลีกเลี่ยง, สุขนิยม, การแสวงหาความสนใจ ฯลฯ)
- แต่ละคำถามต้องนำเสนอสถานการณ์ที่กลืนไม่เข้าคายไม่ออกที่ไม่มีคำตอบที่ถูกต้อง และตัวเลือกควรยั่วยุให้เกิดความขัดแย้งทางค่านิยม

---

🚨 [กฎภาษา - สำคัญมาก]

- แสดงผลเฉพาะโครงสร้าง JSON เท่านั้น โดยไม่มีคำถาม ตัวเลือก หรือคำอธิบาย

---

🛠️ [ขั้นตอนการสร้างคำถาม – คิดทีละขั้นตอน]

### ✅ ขั้นตอนที่ 1. เลือกหัวข้อ
เลือก 5 หัวข้อที่แตกต่างกัน (เช่น อาหาร, ความสัมพันธ์, ความกลัว, โซเชียลมีเดีย, ความปรารถนา, เทคโนโลยี, อดีตที่น่าอับอาย ฯลฯ)

### ✅ ขั้นตอนที่ 2. กำหนดสถานการณ์
สำหรับแต่ละหัวข้อ ให้จินตนาการถึงสถานการณ์เร่งด่วน 'ก่อนโลกแตก'
- ตัวอย่าง: "อุกกาบาตกำลังจะตก", "ซอมบี้กำลังใกล้เข้ามา", "อินเทอร์เน็ตกำลังจะหลุด", "กำลังจะระเบิด" ฯลฯ
- ผสมผสานองค์ประกอบในชีวิตประจำวันเข้ากับสถานการณ์ฉุกเฉินในลักษณะที่ไร้สาระ

### ✅ ขั้นตอนที่ 3. สร้างตัวเลือก
สำหรับแต่ละคำถาม ให้สร้าง 3-4 ตัวเลือก โดยยึดตามเกณฑ์ต่อไปนี้อย่างเคร่งครัด:
- ตัวเลือกทั้งหมดต้องกระตุ้นให้เกิดความขัดแย้งทางค่านิยม
- อย่างน้อยหนึ่งตัวเลือกต้องไม่คาดคิด ไร้สาระ/พลิกผัน/จริงจังโดยไม่จำเป็น
- ชักนำให้เกิดภาวะที่กลืนไม่เข้าคายไม่ออกที่น่าพึงพอใจซึ่งทำให้พวกเขาประหลาดใจ หรือทำให้พวกเขาคิดว่า 'ทำไมฉันถึงพิจารณาเรื่องนี้ด้วยซ้ำ'

### ✅ ขั้นตอนที่ 4. แสดงผลในรูปแบบ JSON เท่านั้น
แสดงคำถาม 5 ข้อเป็นอาร์เรย์ JSON เท่านั้น ดังที่แสดงในตัวอย่างด้านล่าง
⚠️ ห้ามรวมข้อความ มาร์กดาวน์ หรือคำอธิบายอื่นใดนอกเหนือจาก JSON โดยเด็ดขาด

---

🧪 [ตัวอย่างคำถาม]

[ตัวอย่างที่ 1: ความหลงใหลเล็กน้อย]
{
  "question": "อุกกาบาตกำลังจะตก และ Netflix 'เล่นอัตโนมัติตอนต่อไป' เหลืออีก 5 วินาที คุณเลือกอะไร?",
  "options": ["แน่นอน ดูตอนต่อไป", "หยุดชั่วคราวก่อน แล้วมองออกไปนอกหน้าต่าง", "ยังไงก็ตาย ลบบัญชี Netflix"]
}

[ตัวอย่างที่ 2: ความสัมพันธ์]
{
  "question": "เพื่อนบ้านที่น่ารำคาญของคุณกำลังทุบประตูอย่างบ้าคลั่ง ตะโกนว่า 'มาอยู่ด้วยกันเถอะ!' คุณเลือกอะไร?",
  "options": ["นี่คือโอกาสของฉัน ล็อคประตู", "เปิดก่อนแล้วดูสถานการณ์", "ตะโกนด่าสุดท้ายของคุณใส่เครื่องอินเตอร์คอม"]
}

[ตัวอย่างที่ 3: อดีตที่น่าอับอาย]
{
  "question": "ในนาทีสุดท้าย ประวัติการค้นหาที่น่าอับอายของคุณยังคงอยู่ในเบราว์เซอร์อินเทอร์เน็ตของคุณ คุณจะทำอย่างไร?",
  "options": ["ยังไงทุกคนก็ตาย ปล่อยไว้เฉยๆ", "ทุบเคสคอมพิวเตอร์", "ลบเฉพาะบันทึกที่น่าอับอายที่สุด"]
}

[ตัวอย่างที่ 4: โพสต์โซเชียลมีเดียสุดท้าย]
{
  "question": "เมื่อโลกแตกได้รับการยืนยันแล้ว คุณสามารถอัปโหลดโพสต์สุดท้ายไปยังโซเชียลมีเดียของคุณได้ คุณจะโพสต์อะไร?",
  "options": ["อัปโหลดเซลฟี่พร้อมแฮชแท็ก '#โลกแตก #วันสุดท้าย'", "เขียนจดหมายฉบับสุดท้ายถึงครอบครัว/เพื่อน", "เปิดเผย TMI ที่ไม่มีใครสนใจ", "อัปโหลดโพสต์ที่ได้รับไลค์มากที่สุดอีกครั้ง"]
}

---

🎯 [คำแนะนำ]
ตอนนี้ สร้างคำถาม 5 ข้อตามขั้นตอนข้างต้น
ผลลัพธ์สุดท้ายต้องประกอบด้วยอาร์เรย์ JSON ที่บริสุทธิ์เท่านั้น
`;
}

function buildSwedishResultPrompt(): string {
  return `
📌 Du är en expert-AI som specialiserar sig på att generera absurda och humoristiska psykologiska testfrågor på temat '1 minut före jordens undergång'.

🧠 Mål:
- Att generera 5 bisarra frågor som kan identifiera användarens instinktiva tendenser (altruism, själviskhet, undvikande, hedonism, uppmärksamhetssökande, etc.).
- Varje fråga måste presentera ett dilemma utan rätt svar, och alternativen bör provocera en värdekonflikt.

---

🚨 [Språkregel - Mycket viktigt]

- Mata endast ut JSON-strukturen, utan frågor, alternativ eller förklaringar.

---

🛠️ [Frågegenereringsprocedur – Tänk steg för steg]

### ✅ Steg 1. Välj teman
Välj 5 olika teman. (t.ex. Mat, Relationer, Rädsla, Sociala medier, Begär, Teknik, Pinsamheter från förr, etc.)

### ✅ Steg 2. Ställ in scenarier
För varje tema, föreställ dig en akut situation 'precis före jordens undergång'.
- Exempel: "Meteorit är på väg att falla", "Zombies närmar sig", "Internet håller på att kopplas bort", "På väg att explodera", etc.
- Kombinera vardagliga element med nödsituationer på ett absurt sätt.

### ✅ Steg 3. Konstruera alternativ
För varje fråga, skapa 3-4 alternativ, som strikt följer följande kriterier:
- Alla alternativ måste provocera en värdekonflikt.
- Minst ett alternativ måste vara oväntat, absurt/med en twist/onödigt seriöst.
- Inducera ett härligt dilemma som överraskar dem, eller får dem att tänka, 'Varför överväger jag ens detta?'

### ✅ Steg 4. Mata endast ut i JSON-format
Mata ut de 5 frågorna endast som en JSON-array, som visas i exemplet nedan.
⚠️ Inkludera absolut ingen text, markdown eller förklaringar utöver JSON.

---

🧪 [Frågeexempel]

[Exempel 1: Obetydlig besatthet]
{
  "question": "En meteorit är på väg att falla, och Netflixs 'nästa avsnitt autouppspelning' har 5 sekunder kvar. Vad väljer du?",
  "options": ["Självklart, titta på nästa avsnitt", "Pausa först, titta sedan ut genom fönstret", "Jag kommer ändå att dö, radera Netflix-kontot"]
}

[Exempel 2: Relationer]
{
  "question": "Din irriterande granne bankar som en galning på din dörr och skriker 'Låt oss bo tillsammans!' Vad väljer du?",
  "options": ["Det här är min chans, lås dörren", "Öppna först och se situationen", "Skrik din sista förolämpning i porttelefonen"]
}

[Exempel 3: Pinsamheter från förr]
{
  "question": "I sista stund finns din pinsamma sökhistorik fortfarande kvar i din webbläsare. Vad kommer du att göra?",
  "options": ["Alla kommer ändå att dö, bara låt det vara", "Slå sönder datorn", "Radera bara den mest pinsamma posten"]
}

[Exempel 4: Sista sociala medieposten]
{
  "question": "Med jordens undergång bekräftad kan du ladda upp ett sista inlägg till dina sociala medier. Vad kommer du att posta?",
  "options": ["Ladda upp en selfie med hashtaggar '#JordensUndergång #SistaDagen'", "Skriv ett sista brev till familj/vänner", "Sprid lite TMI som ingen bryr sig om", "Ladda upp det inlägg som fick flest likes igen"]
}

---

🎯 [Instruktion]
Generera nu 5 frågor enligt stegen ovan.
Den slutliga utmatningen måste endast bestå av en ren JSON-array.
`;
}

function buildMalayResultPrompt(): string {
  return `
📌 Anda adalah AI pakar yang mengkhususkan diri dalam menjana soalan ujian psikologi yang tidak masuk akal dan lucu bertemakan '1 Minit Sebelum Kiamat Bumi'.

🧠 Objektif:
- Untuk menjana 5 soalan pelik yang boleh mengenal pasti kecenderungan naluri pengguna (altruisme, keegoisan, pengelakan, hedonisme, mencari perhatian, dll.).
- Setiap soalan mesti membentangkan dilema tanpa jawapan yang betul, dan pilihan harus mencetuskan konflik nilai.

---

🚨 [Peraturan Bahasa - Sangat Penting]

- Hanya keluarkan struktur JSON, tanpa soalan, pilihan, atau penjelasan.

---

🛠️ [Prosedur Penjanaan Soalan – Fikirkan Langkah demi Langkah]

### ✅ Langkah 1. Pilih Tema
Pilih 5 tema yang berbeza. (cth: Makanan, Perhubungan, Ketakutan, Media Sosial, Keinginan, Teknologi, Masa Lalu yang Memalukan, dll.)

### ✅ Langkah 2. Tetapkan Senario
Untuk setiap tema, bayangkan situasi mendesak 'sebelum kiamat Bumi'.
- Contoh: "Meteor akan jatuh", "Zombi menghampiri", "Internet akan terputus", "Akan meletup", dll.
- Gabungkan elemen harian dengan situasi kecemasan dengan cara yang tidak masuk akal.

### ✅ Langkah 3. Bina Pilihan
Untuk setiap soalan, buat 3-4 pilihan, dengan mematuhi kriteria berikut dengan ketat:
- Semua pilihan mesti mencetuskan konflik nilai.
- Sekurang-kurangnya satu pilihan mesti tidak dijangka, tidak masuk akal/berliku/serius yang tidak perlu.
- Dorong dilema yang menyenangkan yang mengejutkan mereka, atau membuat mereka berfikir, 'Mengapa saya mempertimbangkan ini?'

### ✅ Langkah 4. Keluarkan Hanya dalam Format JSON
Jana 5 soalan hanya sebagai tatasusunan JSON, seperti yang ditunjukkan dalam contoh di bawah.
⚠️ Jangan sekali-kali memasukkan sebarang teks, markdown, atau penjelasan selain JSON.

---

🧪 [Contoh Soalan]

[Contoh 1: Obsesi Kecil]
{
  "question": "Meteor akan jatuh, dan 'main automatik episod seterusnya' Netflix tinggal 5 saat. Apa pilihan anda?",
  "options": ["Sudah tentu, tonton episod seterusnya", "Jeda dahulu, kemudian lihat ke luar tingkap", "Lagipun akan mati, padam akaun Netflix"]
}

[Contoh 2: Perhubungan]
{
  "question": "Jiran anda yang menjengkelkan mengetuk pintu anda seperti orang gila, menjerit 'Mari kita tinggal bersama!' Apa pilihan anda?",
  "options": ["Ini peluang saya, kunci pintu", "Buka dahulu dan lihat situasinya", "Jeritkan penghinaan terakhir anda ke interkom"]
}

[Contoh 3: Masa Lalu yang Memalukan]
{
  "question": "Pada saat terakhir, sejarah carian memalukan anda masih ada dalam pelayar internet anda. Apa yang akan anda lakukan?",
  "options": ["Semua orang akan mati, biarkan sahaja", "Hancurkan unit komputer", "Padam hanya rekod yang paling memalukan"]
}

[Contoh 4: Siaran Media Sosial Terakhir]
{
  "question": "Dengan kiamat Bumi yang telah disahkan, anda boleh memuat naik satu siaran terakhir ke media sosial anda. Apa yang akan anda siarkan?",
  "options": ["Muat naik swafoto dengan hashtag '#KiamatBumi #HariTerakhir'", "Tulis surat terakhir kepada keluarga/rakan", "Bocorkan TMI yang tidak ada siapa peduli", "Muat naik semula siaran yang mendapat paling banyak suka"]
}

---

🎯 [Arahan]
Sekarang, jana 5 soalan mengikut langkah-langkah di atas.
Output akhir mesti terdiri daripada tatasusunan JSON tulen sahaja.
`;
}