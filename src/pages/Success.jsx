import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { save } from '../lib/store.js'

export default function Success() {
  useEffect(() => { save('subscribed', true) }, [])
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
      <img src="/logo.svg" alt="Jido" style={{ width: 80 }} />
      <h1 style={{ margin: '16px 0 8px', color: 'var(--navy)' }}>ご登録ありがとうございます！</h1>
      <p className="muted">お支払いが完了しました。Jidoのすべての機能をご利用いただけます。</p>
      <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/settings" className="btn btn-navy">まず会社情報を設定する</Link>
        <Link to="/documents" className="btn btn-primary">書類を作成する</Link>
      </div>
    </div>
  )
}
