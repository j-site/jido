import { getStripe, findActiveCustomer, hashPassword, signToken } from './_auth.js'

// 初回登録: 決済済みメール + 新パスワード設定
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' })
  if (String(password).length < 8) return res.status(400).json({ error: 'パスワードは8文字以上にしてください' })

  try {
    const stripe = getStripe()
    const customer = await findActiveCustomer(stripe, email)
    if (!customer) {
      return res.status(403).json({ error: '有効なご契約が見つかりません。決済時のメールアドレスをご確認ください。' })
    }
    if (customer.metadata?.pw_hash) {
      return res.status(409).json({ error: '既に登録済みです。ログインしてください。' })
    }
    await stripe.customers.update(customer.id, {
      metadata: { ...customer.metadata, pw_hash: hashPassword(password) },
    })
    return res.status(200).json({ token: signToken({ email: email.trim().toLowerCase(), cid: customer.id }) })
  } catch (err) {
    console.error('register error:', err.message)
    return res.status(500).json({ error: err.message.includes('未設定') ? err.message : '登録に失敗しました' })
  }
}
