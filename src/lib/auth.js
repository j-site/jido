import { load, save } from './store.js'

const TRIAL_MS = 3 * 24 * 60 * 60 * 1000
const DAY = 24 * 60 * 60 * 1000

// セッション種別:
//   { type:'trial', startedAt }           — トライアル中（カード未登録）
//   { type:'paid', token, email, checkedAt } — 契約済み
export const getSession = () => load('session', null)
export const logout = () => save('session', null)

// 初回アクセス時に自動でトライアル開始（メール不要）
export const ensureTrial = () => {
  const s = getSession()
  if (!s) save('session', { type: 'trial', startedAt: Date.now() })
}

export const trialRemainingMs = () => {
  const s = getSession()
  if (s?.type !== 'trial') return 0
  return Math.max(0, s.startedAt + TRIAL_MS - Date.now())
}

export const isTrial = () => getSession()?.type === 'trial'
export const isTrialExpired = () => isTrial() && trialRemainingMs() === 0

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

export const register = async (email, password) => {
  const { token } = await call('/api/register', { email, password })
  save('session', { type: 'paid', token, email, checkedAt: Date.now() })
}

export const login = async (email, password) => {
  const { token } = await call('/api/login', { email, password })
  save('session', { type: 'paid', token, email, checkedAt: Date.now() })
}

const revalidate = async (session) => {
  try {
    const { active } = await call('/api/session', { token: session.token })
    if (active) save('session', { ...session, checkedAt: Date.now() })
    else logout()
  } catch { /* オフライン時は次回再試行 */ }
}

export const isLoggedIn = () => {
  const s = getSession()
  if (!s) return false
  if (s.type === 'trial') return trialRemainingMs() > 0
  if (s.type === 'paid') {
    if (Date.now() - s.checkedAt > DAY) revalidate(s)
    return true
  }
  return false
}
