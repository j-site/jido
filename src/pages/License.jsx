import { useState } from 'react'
import { Link } from 'react-router-dom'
import { verifyLicense } from '../lib/license.js'

// 契約確認ゲート: 決済時のメールアドレスでStripe契約状態を照会する
export default function License({ onUnlock }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const check = async () => {
    if (!email.trim()) { setMsg('メールアドレスを入力してください'); return }
    setBusy(true); setMsg('')
    try {
      const lic = await verifyLicense(email.trim())
      if (lic.active) onUnlock()
      else setMsg('有効なご契約が見つかりません。お支払いが確認できない場合、その月からご利用を停止しております。決済時のメールアドレスをご確認いただくか、再度ご登録ください。')
    } catch (e) {
      setMsg(e.message || '確認に失敗しました。通信環境をご確認ください。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: 48 }}>
      <img src="/logo.svg" alt="Jido" style={{ width: 72 }} />
      <h1 style={{ margin: '12px 0 4px', color: 'var(--navy)', fontSize: 22 }}>ご契約の確認</h1>
      <p className="muted">決済時のメールアドレスを入力してください。</p>
      <div style={{ display: 'flex', gap: 8, margin: '20px 0 12px' }}>
        <input type="email" placeholder="メールアドレス" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()} />
        <button className="btn btn-primary" onClick={check} disabled={busy}>
          {busy ? '確認中…' : '確認'}
        </button>
      </div>
      {msg && <p style={{ color: '#b91c1c', fontSize: 13, textAlign: 'left' }}>{msg}</p>}
      <p className="muted" style={{ marginTop: 20 }}>
        まだご契約でない方は <Link to="/" style={{ textDecoration: 'underline' }}>こちらからご登録</Link>（月額¥1,200）
      </p>
    </div>
  )
}
