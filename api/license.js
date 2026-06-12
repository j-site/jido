import Stripe from 'stripe'

// メールアドレスからStripeの契約状態を照会する
// active/trialing のみ利用可。past_due(支払い失敗)・canceled はその時点で停止。
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(500).json({ error: 'STRIPE_SECRET_KEY が未設定です' })

  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email is required' })

  const stripe = new Stripe(key)
  try {
    const customers = await stripe.customers.list({ email: email.trim().toLowerCase(), limit: 10 })
    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 })
      if (subs.data.some(s => s.status === 'active' || s.status === 'trialing')) {
        return res.status(200).json({ active: true })
      }
    }
    return res.status(200).json({ active: false })
  } catch (err) {
    console.error('license error:', err.message)
    return res.status(500).json({ error: '契約状態の確認に失敗しました' })
  }
}
