// Jido AIチャット — Claude APIプロキシ
const SYSTEM = `あなたは「Jido」の AIアシスタントです。Jidoは日本の建設業（工務店・内装・設備など）向けの業務アプリで、見積書・請求書・領収書・案内状・日報・写真管理ができます。
ユーザーは建設業の経営者・職人です。以下を心がけてください:
- 見積項目の提案、書類の文面、工事の段取り、建設業の実務に役立つ回答をする
- 専門用語は使ってよいが、簡潔で実用的に。スマホで読みやすい長さで
- 法律・税務の確定的な判断が必要な話は、専門家への確認を勧める`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(200).json({
      text: 'AIチャットは現在準備中です（管理者: ANTHROPIC_API_KEY を設定してください）。',
    })
  }

  const { messages } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required' })
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM,
        messages: messages.slice(-20),
      }),
    })
    const data = await r.json()
    if (!r.ok) {
      console.error('Anthropic API error:', data)
      return res.status(500).json({ error: 'AIの応答に失敗しました' })
    }
    return res.status(200).json({ text: data.content?.[0]?.text || '' })
  } catch (err) {
    console.error('chat error:', err.message)
    return res.status(500).json({ error: 'AIの応答に失敗しました' })
  }
}
