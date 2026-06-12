import { Link } from 'react-router-dom'
import { load, save, yen } from '../lib/store.js'
import { useState } from 'react'

const TYPE_LABEL = { estimate: '見積書', invoice: '請求書', receipt: '領収書', letter: '案内状' }

export default function Documents() {
  const [docs, setDocs] = useState(() => load('docs', []))

  const remove = (id) => {
    if (!confirm('この書類を削除しますか？')) return
    const next = docs.filter(d => d.id !== id)
    setDocs(next); save('docs', next)
  }

  return (
    <div className="container">
      <div className="card">
        <h2>新規作成</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_LABEL).map(([t, label]) => (
            <Link key={t} to={`/documents/new/${t}`} className="btn btn-navy btn-sm">＋ {label}</Link>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>発行済み書類</h2>
        {docs.length === 0 && <p className="muted">まだ書類がありません。上のボタンから作成できます。</p>}
        {docs.map(d => (
          <div key={d.id} className="list-row">
            <span className="badge warn">{TYPE_LABEL[d.type]}</span>
            <Link to={`/documents/${d.id}`} className="grow">
              <strong>{d.clientName || '（宛名未設定）'}</strong>
              <span className="muted">　{d.docNo}　{d.date}</span>
            </Link>
            {d.total != null && <span>{yen(d.total)}</span>}
            <button className="btn btn-danger btn-sm" onClick={() => remove(d.id)}>削除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
