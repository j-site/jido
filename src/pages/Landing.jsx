import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()

  return (
    <>
      <section className="hero">
        <img src="/logo.svg" alt="Jido" />
        <h1>建設業の事務を、<em>自動</em>に。</h1>
        <p>見積書・請求書・領収書・案内状・日報・写真管理・AIチャット。<br />
          現場仕事のあとの「もうひと仕事」を、Jidoがぜんぶ引き受けます。スマホひとつでOK。</p>

        <div style={{ margin: '12px 0 6px' }}>
          <span style={{ background: '#ff8c00', color: '#fff', fontWeight: 700, fontSize: 14, padding: '4px 18px', borderRadius: 999 }}>
            3日間 無料・登録不要
          </span>
        </div>
        <div className="price-tag" style={{ marginTop: 6 }}>
          その後 月額 ¥1,200<small>（税込）/ いつでも解約OK</small>
        </div>

        <button
          className="btn btn-primary"
          style={{ marginTop: 20, fontSize: 17, padding: '14px 40px', borderRadius: 12 }}
          onClick={() => navigate('/documents')}
        >
          今すぐ無料で使う
        </button>
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
