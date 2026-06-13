import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSession, login, register } from '../lib/auth.js'

// トライアル終了 → カード登録（即課金）促進画面
export default function TrialExpired({ onUnlock }) {
  const session = getSession()
  const email = session?.email || ''
  const [mode, setMode] = useState('pay')         // 'pay' | 'register' | 'login'
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // カード登録決済ページへ
  const goCheckout = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setMsg(data.error || 'エラーが発生しました')
    } catch { setMsg('通信エラーが発生しました') }
    finally { setBusy(false) }
  }

  // 決済完了後にパスワードを設定してログイン
  const doRegister = async () => {
    if (!password) { setMsg('パスワードを入力してください'); return }
    setBusy(true); setMsg('')
    try { await register(email, password); onUnlock() }
    catch (e) {
      if (e.message.includes('既に登録済み')) { setMode('login'); setMsg('パスワードは設定済みです。ログインしてください。') }
      else setMsg(e.message)
    } finally { setBusy(false) }
  }

  const doLogin = async () => {
    if (!password) { setMsg('パスワードを入力してください'); return }
    setBusy(true); setMsg('')
    try { await login(email, password); onUnlock() }
    catch (e) { setMsg(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 48, textAlign: 'center' }}>
      <img src="/logo.svg" alt="Jido" style={{ width: 72 }} />
      <h1 style={{ margin: '12px 0 4px', color: 'var(--navy)', fontSize: 22 }}>3日間トライアルが終了しました</h1>
      <p className="muted">引き続きご利用いただくには、カードを登録してください。</p>

      {mode === 'pay' && (
        <div className="card" style={{ marginTop: 20, textAlign: 'left' }}>
          <p>登録メールアドレス：<strong>{email}</strong></p>
          <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>月額 ¥1,200（税込）/ いつでも解約OK</p>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
            onClick={goCheckout} disabled={busy}>
            {busy ? '処理中…' : 'カードを登録して続ける（¥1,200/月）'}
          </button>
          {msg && <p style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{msg}</p>}
          <p style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
            <a href="#" onClick={e => { e.preventDefault(); setMode('login') }}
              style={{ color: 'var(--orange)', textDecoration: 'underline' }}>
              すでにカード登録済みの方はこちら
            </a>
          </p>
        </div>
      )}

      {(mode === 'register' || mode === 'login') && (
        <div className="card" style={{ marginTop: 20, textAlign: 'left' }}>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            {mode === 'register'
              ? '決済完了後、パスワードを設定してログインします。'
              : 'メールアドレスとパスワードでログインします。'}
          </p>
          <label className="field"><span>メールアドレス</span>
            <input type="email" value={email} readOnly style={{ background: '#f1f5f9' }} /></label>
          <label className="field"><span>パスワード</span>
            <input type="password" value={password} autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'register' ? doRegister() : doLogin())} /></label>
          {msg && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 8 }}>{msg}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }}
            onClick={mode === 'register' ? doRegister : doLogin} disabled={busy}>
            {busy ? '確認中…' : mode === 'register' ? '登録してはじめる' : 'ログイン'}
          </button>
          <p style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
            <a href="#" onClick={e => { e.preventDefault(); setMode('pay') }}
              style={{ color: 'var(--orange)', textDecoration: 'underline' }}>← 戻る</a>
          </p>
        </div>
      )}

      <p className="muted" style={{ marginTop: 20, fontSize: 13 }}>
        <Link to="/" style={{ textDecoration: 'underline' }}>トップページへ</Link>
      </p>
    </div>
  )
}
