import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { startTrial } from '../lib/auth.js'

const FEATURES = [
  { icon: '📄', name: '見積書', desc: '明細を入れるだけで自動計算。そのままPDF保存' },
  { icon: '🧾', name: '請求書', desc: '見積からワンタップで請求書に変換' },
  { icon: '🧾', name: '領収書', desc: '税込金額から内訳を自動計算' },
  { icon: '✉️', name: '案内状', desc: '工事のご案内文書もテンプレで即作成' },
  { icon: '📝', name: '日報', desc: '現場・天候・人員・作業内容をスマホで記録' },
  { icon: '📷', name: '写真管理', desc: '現場写真を現場名・タグで整理' },
  { icon: '🤖', name: 'AIチャット', desc: '書類の書き方・工事の段取りをAIに相談' },
]

export default function Landing() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const tryFree = async () => {
    if (!email.trim()) { setMsg('メールアドレスを入力してください'); return }
    setLoading(true); setMsg('')
    try {
      await startTrial(email.trim())
      navigate('/documents')
    } catch (e) {
      if (e.message === 'SUBSCRIBED') {
        setMsg('このメールアドレスはすでにご契約中です。')
        setTimeout(() => navigate('/documents'), 1500)
      } else if (e.message === 'EXPIRED') {
        setMsg('トライアル期間が終了しています。下のログインからカード登録してご利用ください。')
      } else {
        setMsg(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="hero">
        <img src="/logo.svg" alt="Jido" />
        <h1>建設業の事務を、<em>自動</em>に。</h1>
        <p>見積書・請求書・領収書・案内状・日報・写真管理・AIチャット。
          現場仕事のあとの「もうひと仕事」を、Jidoがぜんぶ引き受けます。スマホひとつでOK。</p>

        <div style={{ margin: '12px 0 4px' }}>
          <span style={{ background: '#ff8c00', color: '#fff', fontWeight: 700, fontSize: 14, padding: '4px 16px', borderRadius: 999 }}>
            3日間 無料・カード不要
          </span>
        </div>
        <div className="price-tag" style={{ marginTop: 6 }}>その後 月額 ¥1,200<small>（税込）/ いつでも解約OK</small></div>

        <div style={{ maxWidth: 420, margin: '16px auto 0', display: 'flex', gap: 8 }}>
          <input type="email" placeholder="メールアドレス" value={email}
            onChange={e => { setEmail(e.target.value); setMsg('') }} style={{ flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && tryFree()} />
          <button className="btn btn-primary" onClick={tryFree} disabled={loading}>
            {loading ? '処理中…' : '無料で試す'}
          </button>
        </div>
        {msg && <p style={{ color: '#ffd0a0', fontSize: 13, marginTop: 8 }}>{msg}</p>}

        <p style={{ marginTop: 14, fontSize: 13 }}>
          <Link to="/documents" style={{ color: '#ffb347', textDecoration: 'underline' }}>
            ご契約済み・トライアル中の方はこちら →
          </Link>
        </p>
      </section>

      <div className="container">
        <div className="grid3" style={{ marginTop: 8 }}>
          {FEATURES.map(f => (
            <div key={f.name} className="card feature-card">
              <div className="icon">{f.icon}</div>
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="card" style={{ textAlign: 'center', marginTop: 24 }}>
          <h2>つくった書類は、その場でPDF</h2>
          <p className="muted">スマホ・PCのブラウザだけで完結。アプリのインストールは不要です。<br />
            データは端末に保存されるので、オフラインの現場でも書類を確認できます。</p>
        </div>
      </div>
    </>
  )
}
