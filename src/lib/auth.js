import { load, save } from './store.js'

const DAY = 24 * 60 * 60 * 1000

// セッション種別:
//   { type:'trial', email, trialEnd, checkedAt }  — トライアル中（カード未登録）
//   { type:'paid', token, email, checkedAt }       — 契約済み（ログイン済み）
export const getSession = () => load('session', null)
export const logout = () => save('session', null)

const call = async (path, body) => {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
  return data
}

// トライアル開始（メールのみ）
export const startTrial = async (email) => {
  const data = await call('/api/trial-signup', { email })
  if (data.status === 'subscribed') {
    // すでに契約済み → ログイン画面へ誘導
    throw new Error('SUBSCRIBED')
  }
  if (data.status === 'expired') {
    throw new Error('EXPIRED')
  }
  const trialEnd = Date.now() + (data.remaining_ms || 0)
  save('session', { type: 'trial', email, trialEnd, checkedAt: Date.now() })
  return trialEnd
}

// パスワード登録（トライアル → 契約への橋渡し）
export const register = async (email, password) => {
  const { token } = await call('/api/register', { email, password })
  save('session', { type: 'paid', token, email, checkedAt: Date.now() })
}

export const login = async (email, password) => {
  const { token } = await call('/api/login', { email, password })
  save('session', { type: 'paid', token, email, checkedAt: Date.now() })
}

// 契約状態を再確認。未払い・解約ならセッションを破棄
const revalidate = async (session) => {
  try {
    const { active } = await call('/api/session', { token: session.token })
    if (active) save('session', { ...session, checkedAt: Date.now() })
    else logout()
  } catch { /* オフライン時は次回再試行 */ }
}

// アプリ利用可能か判定
// - トライアル中（期限内）→ true
// - 契約済みログイン中 → true（24h毎に再確認）
// - トライアル期限切れ / 未ログイン → false
export const isLoggedIn = () => {
  const s = getSession()
  if (!s) return false
  if (s.type === 'trial') {
    return Date.now() < s.trialEnd
  }
  if (s.type === 'paid') {
    if (Date.now() - s.checkedAt > DAY) revalidate(s)
    return true
  }
  return false
}

export const isTrialExpired = () => {
  const s = getSession()
  return s?.type === 'trial' && Date.now() >= s.trialEnd
}

export const isTrial = () => getSession()?.type === 'trial'
