import { load, save } from './store.js'

const DAY = 24 * 60 * 60 * 1000

// ライセンス状態: { email, active, checkedAt }
export const getLicense = () => load('license', null)

export const clearLicense = () => save('license', null)

// メールでStripe契約状態を照会して保存
export const verifyLicense = async (email) => {
  const res = await fetch('/api/license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  const lic = { email, active: !!data.active, checkedAt: Date.now() }
  save('license', lic)
  return lic
}

// 有効ならtrue。24時間経過していたら裏で再確認し、
// 未払い・解約になっていればその時点で停止する。
export const isActive = () => {
  const lic = getLicense()
  if (!lic?.active) return false
  if (Date.now() - lic.checkedAt > DAY) {
    verifyLicense(lic.email).catch(() => {/* オフライン時は次回再試行 */})
  }
  return true
}
