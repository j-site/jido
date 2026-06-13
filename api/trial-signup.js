import Stripe from 'stripe'

const TRIAL_DAYS = 3

// メールだけでトライアル開始（カード不要）
// Stripe顧客を作成してtrial_startをmetadataに記録する
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(500).json({ error: 'STRIPE_SECRET_KEY が未設定です' })

  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'メールアドレスを入力してください' })

  const stripe = new Stripe(key)
  try {
    // 既存顧客チェック
    const existing = await stripe.customers.list({ email: email.trim().toLowerCase(), limit: 5 })
    let customer = existing.data[0]

    if (customer) {
      // すでにアクティブな契約があればそのままログインへ
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 1 })
      if (subs.data.length > 0) {
        return res.status(200).json({ status: 'subscribed' })
      }
      // トライアル開始済みか確認
      if (customer.metadata?.trial_start) {
        const elapsed = Date.now() - Number(customer.metadata.trial_start)
        const remaining = TRIAL_DAYS * 24 * 60 * 60 * 1000 - elapsed
        if (remaining > 0) {
          return res.status(200).json({ status: 'trial', remaining_ms: remaining })
        } else {
          return res.status(200).json({ status: 'expired' })
        }
      }
    }

    // 新規顧客作成 or trial_start未設定の既存顧客に設定
    if (!customer) {
      customer = await stripe.customers.create({
        email: email.trim().toLowerCase(),
        metadata: { trial_start: String(Date.now()) },
      })
    } else {
      await stripe.customers.update(customer.id, {
        metadata: { ...customer.metadata, trial_start: String(Date.now()) },
      })
    }

    return res.status(200).json({ status: 'trial', remaining_ms: TRIAL_DAYS * 24 * 60 * 60 * 1000 })
  } catch (err) {
    console.error('trial-signup error:', err.message)
    return res.status(500).json({ error: 'トライアル開始に失敗しました' })
  }
}
