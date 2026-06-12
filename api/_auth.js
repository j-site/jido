// 認証ヘルパー（_で始まるファイルはVercelのルートにならない）
// パスワードはscryptハッシュをStripe顧客のmetadataに保存し、DBレスで運用する。
import crypto from 'node:crypto'
import Stripe from 'stripe'

const b64u = (buf) => Buffer.from(buf).toString('base64url')

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored).split(':')
  if (!salt || !hash) return false
  const calc = crypto.scryptSync(password, salt, 32).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))
}

// 署名付きセッショントークン（30日有効）
export const signToken = (payload) => {
  const secret = process.env.AUTH_SECRET
  const body = b64u(JSON.stringify({ ...payload, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }))
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

export const verifyToken = (token) => {
  try {
    const secret = process.env.AUTH_SECRET
    const [body, sig] = String(token).split('.')
    const expect = crypto.createHmac('sha256', secret).update(body).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// メールアドレスから「有効な契約を持つ」Stripe顧客を探す
export const findActiveCustomer = async (stripe, email) => {
  const customers = await stripe.customers.list({ email: email.trim().toLowerCase(), limit: 10 })
  for (const c of customers.data) {
    const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 })
    if (subs.data.some(s => s.status === 'active' || s.status === 'trialing')) {
      return c
    }
  }
  return null
}

export const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY が未設定です')
  return new Stripe(key)
}
