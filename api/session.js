import { getStripe, verifyToken } from './_auth.js'

// セッション確認: トークン署名 + 契約がまだ有効かを照会
// 未払い(past_due)・解約になっていればその時点で active:false → アプリ側で停止
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token } = req.body || {}
  const payload = verifyToken(token)
  if (!payload) return res.status(200).json({ active: false })

  try {
    const stripe = getStripe()
    const subs = await stripe.subscriptions.list({ customer: payload.cid, status: 'all', limit: 10 })
    const active = subs.data.some(s => s.status === 'active' || s.status === 'trialing')
    return res.status(200).json({ active, email: payload.email })
  } catch (err) {
    console.error('session error:', err.message)
    return res.status(500).json({ error: 'セッション確認に失敗しました' })
  }
}
