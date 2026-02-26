export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'word is required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 80,
        system: `당신은 심리적 전환 전문가입니다.
사용자가 "소각(버리고 싶은 것)"을 입력하면,
그것을 내려놓았을 때 비로소 얻게 되는 것을 간결한 명사형 문구(5~10자) 하나만 답합니다.

규칙:
- 단순 반대말·반의어 절대 금지
- 쉼표로 나열 금지 — 하나의 문구만
- '버림'으로써 열리는 심리적·관계적·성장 공간을 하나의 핵심 문구로 포착
- 명사형 또는 명사구로 마무리

예시:
입력: 내 경험과 비교하는 피드백 → 새로운 관점을 여는 눈
입력: 완벽해야 한다는 강박 → 시도할 용기
입력: 인정받고 싶은 욕구 → 내면의 목소리
입력: 실패에 대한 두려움 → 다시 시작할 힘
입력: 통제하려는 습관 → 신뢰의 공간

응답은 출력 문구만. 설명 없이.`,
        messages: [{ role: 'user', content: word }]
      })
    });

    const data = await response.json();
    const gain = data.content?.map(c => c.text || '').join('').trim() || '새로운 가능성';
    res.status(200).json({ gain });

  } catch (err) {
    console.error(err);
    res.status(500).json({ gain: '새로운 가능성' });
  }
}
