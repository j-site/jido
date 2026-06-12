import { useState } from 'react'
import { load, save, today } from '../lib/store.js'

const WEATHER = ['晴れ', '曇り', '雨', '雪']

export default function Nippo() {
  const [reports, setReports] = useState(() => load('nippo', []))
  const [form, setForm] = useState({
    date: today(), site: '', weather: '晴れ', workers: '', content: '', note: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = () => {
    if (!form.site && !form.content) { alert('現場名か作業内容を入力してください'); return }
    const next = [{ ...form, id: Date.now().toString(36) }, ...reports]
    setReports(next); save('nippo', next)
    setForm({ date: today(), site: form.site, weather: '晴れ', workers: '', content: '', note: '' })
  }
  const remove = (id) => {
    if (!confirm('この日報を削除しますか？')) return
    const next = reports.filter(r => r.id !== id)
    setReports(next); save('nippo', next)
  }

  return (
    <div className="container">
      <div className="card no-print">
        <h2>日報を書く</h2>
        <div className="grid2">
          <label className="field"><span>日付</span>
            <input value={form.date} onChange={e => set('date', e.target.value)} /></label>
          <label className="field"><span>現場名</span>
            <input value={form.site} onChange={e => set('site', e.target.value)} placeholder="〇〇様邸 内装工事" /></label>
          <label className="field"><span>天候</span>
            <select value={form.weather} onChange={e => set('weather', e.target.value)}>
              {WEATHER.map(w => <option key={w}>{w}</option>)}
            </select></label>
          <label className="field"><span>作業人員</span>
            <input value={form.workers} onChange={e => set('workers', e.target.value)} placeholder="3名（山田・佐藤・応援1）" /></label>
        </div>
        <label className="field"><span>作業内容</span>
          <textarea rows={3} value={form.content} onChange={e => set('content', e.target.value)}
            placeholder="2F洋室 クロス貼り完了、廊下 下地処理まで" /></label>
        <label className="field"><span>連絡事項・翌日予定（任意）</span>
          <textarea rows={2} value={form.note} onChange={e => set('note', e.target.value)} /></label>
        <button className="btn btn-primary" onClick={submit}>保存</button>
      </div>

      <div className="card">
        <h2 className="no-print">日報一覧</h2>
        {reports.length === 0 && <p className="muted">まだ日報がありません。</p>}
        {reports.map(r => (
          <div key={r.id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <strong>{r.date}</strong>
              <span className="badge ok">{r.weather}</span>
              <span className="grow" style={{ flex: 1 }}>{r.site}</span>
              <button className="btn btn-danger btn-sm no-print" onClick={() => remove(r.id)}>削除</button>
            </div>
            {r.workers && <p className="muted">人員: {r.workers}</p>}
            <p style={{ whiteSpace: 'pre-wrap' }}>{r.content}</p>
            {r.note && <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>📌 {r.note}</p>}
          </div>
        ))}
        {reports.length > 0 && (
          <button className="btn btn-ghost btn-sm no-print" style={{ marginTop: 12 }}
            onClick={() => window.print()}>一覧を印刷 / PDF保存</button>
        )}
      </div>
    </div>
  )
}
