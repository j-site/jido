import { load, save } from './store.js'

const DAY = 24 * 60 * 60 * 1000

// セッション: { token, email, checkedAt }
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

export const register = async (email, password) => {
  const { token } = await call('/api/register', { email, password })
  save('session', { token, email, checkedAt: Date.now() })
}

export const login = async (email, password) => {
  const { token } = await call('/api/login', { email, password })
  save('session', { token, email, checkedAt: Date.now() })
}

// サーバーに契約状態を再確認。未払い・解約ならセッションを破棄して停止
const revalidate = async (session) => {
  try {
    const { active } = await call('/api/session', { token: session.token })
    if (active) save('session', { ...session, checkedAt: Date.now() })
    else logout()
  } catch { /* オフライン時は次回再試行 */ }
}

// ログイン済みならtrue。24時間ごとに裏で契約状態を再確認する。
export const isLoggedIn = () => {
  const s = getSession()
  if (!s?.token) return false
  if (Date.now() - s.checkedAt > DAY) revalidate(s)
  return true
}
