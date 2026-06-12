import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login, register } from '../lib/auth.js'

// ログイン / 初回登録（決済済みメール＋パスワード設定）
export default function Login({ onUnlock }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async () => {
    if (!email.trim() || !password) { setMsg('メールアドレスとパスワードを入力してください'); return }
    setBusy(true); setMsg('')
    try {
      if (mode === 'register') await register(email.trim(), password)
      else await login(email.trim(), password)
      onUnlock()
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 48 }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.svg" alt="Jido" style={{ width: 72 }} />
        <h1 style={{ margin: '12px 0 4px', color: 'var(--navy)', fontSize: 22 }}>
          {mode === 'login' ? 'ログイン' : '初回登録'}
        </h1>
        <p className="muted">
          {mode === 'login'
            ? '登録済みのメールアドレスとパスワードを入力してください。'
            : '決済時のメールアドレスと、新しいパスワード（8文字以上）を設定してください。'}
        </p>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <label className="field"><span>メールアドレス</span>
          <input type="email" value={email} autoComplete="email"
            onChange={e => setEmail(e.target.value)} /></label>
        <label className="field"><span>パスワード</span>
          <input type="password" value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} /></label>
        {msg && <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 10 }}>{msg}</p>}
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={submit} disabled={busy}>
          {busy ? '確認中…' : mode === 'login' ? 'ログイン' : '登録してはじめる'}
        </button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 13 }}>
        {mode === 'login' ? (
          <>はじめての方（決済後まだパスワード未設定）は{' '}
            <a href="#" onClick={e => { e.preventDefault(); setMode('register'); setMsg('') }}
              style={{ color: 'var(--orange)', textDecoration: 'underline' }}>初回登録</a></>
        ) : (
          <>登録済みの方は{' '}
            <a href="#" onClick={e => { e.preventDefault(); setMode('login'); setMsg('') }}
              style={{ color: 'var(--orange)', textDecoration: 'underline' }}>ログイン</a></>
        )}
      </p>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        まだご契約でない方は <Link to="/" style={{ textDecoration: 'underline' }}>こちらからご登録</Link>（月額¥1,200）
      </p>
    </div>
  )
}
