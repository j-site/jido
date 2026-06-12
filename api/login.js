import { getStripe, findActiveCustomer, verifyPassword, signToken } from './_auth.js'

// ログイン: メール + パスワード → 契約が有効ならセッショントークンを発行
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください' })

  try {
    const stripe = getStripe()
    const customer = await findActiveCustomer(stripe, email)
    if (!customer) {
      // 契約が無い/未払い停止中。なりすまし防止のため詳細は出し分けない
      return res.status(403).json({ error: '有効なご契約が見つかりません。お支払い状況をご確認ください。' })
    }
    if (!customer.metadata?.pw_hash) {
      return res.status(404).json({ error: 'パスワードが未設定です。「初回登録」からパスワードを設定してください。' })
    }
    if (!verifyPassword(password, customer.metadata.pw_hash)) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが違います' })
    }
    return res.status(200).json({ token: signToken({ email: email.trim().toLowerCase(), cid: customer.id }) })
  } catch (err) {
    console.error('login error:', err.message)
    return res.status(500).json({ error: err.message.includes('未設定') ? err.message : 'ログインに失敗しました' })
  }
}
