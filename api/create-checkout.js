import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(500).json({ error: 'STRIPE_SECRET_KEY が未設定です' })

  const stripe = new Stripe(key)
  const origin = req.headers.origin || `https://${req.headers.host}`
  const { email } = req.body || {}

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email || undefined,
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: 'Jido 月額プラン',
            description: '見積書・請求書・領収書・案内状・日報・写真管理・AIチャット',
          },
          unit_amount: 1200,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-checkout error:', err.message)
    return res.status(500).json({ error: '決済セッションの作成に失敗しました' })
  }
}
