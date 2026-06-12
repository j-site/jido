import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { load, save, yen, today, nextDocNo, calcItems } from '../lib/store.js'

const PREFIX = { estimate: 'MS', invoice: 'IV', receipt: 'RC', letter: 'AN' }
const TITLE = { estimate: '御見積書', invoice: '御請求書', receipt: '領収書', letter: 'ご案内' }

const blank = (type, docs) => ({
  id: Date.now().toString(36),
  type,
  date: today(),
  clientName: '',
  honorific: '御中',
  docNo: nextDocNo(PREFIX[type], docs),
  siteAddr: '',
  workName: '',
  validUntil: type === 'estimate' ? '発行より2週間' : '',
  remark: '',
  taxRate: 10,
  items: [{ detail: '', qty: '', unit: '', price: '' }],
  amount: '',   // receipt
  tadashi: '',  // receipt
  subject: '',  // letter
  body: '',     // letter
  ki: '',       // letter
})

export default function DocEditor() {
  const { type, id } = useParams()
  const nav = useNavigate()
  const [docs] = useState(() => load('docs', []))
  const [doc, setDoc] = useState(() =>
    id ? docs.find(d => d.id === id) ?? blank('estimate', docs) : blank(type, docs))
  const [preview, setPreview] = useState(!!id)
  const company = load('company', {})

  const set = (k, v) => setDoc(d => ({ ...d, [k]: v }))
  const setItem = (i, k, v) => setDoc(d => {
    const items = d.items.map((it, j) => j === i ? { ...it, [k]: v } : it)
    return { ...d, items }
  })
  const addRow = () => set('items', [...doc.items, { detail: '', qty: '', unit: '', price: '' }])
  const delRow = (i) => set('items', doc.items.filter((_, j) => j !== i))

  const totals = doc.type === 'receipt'
    ? (() => {
        const total = Number(doc.amount || 0)
        const subtotal = Math.round(total / (1 + doc.taxRate / 100))
        return { subtotal, tax: total - subtotal, total }
      })()
    : calcItems(doc.items, doc.taxRate)

  const persist = () => {
    const rec = { ...doc, total: doc.type === 'letter' ? null : totals.total }
    const rest = load('docs', []).filter(d => d.id !== doc.id)
    save('docs', [rec, ...rest])
    setPreview(true)
  }

  if (preview) return <DocPreview doc={doc} totals={totals} company={company}
    onEdit={() => setPreview(false)} onBack={() => nav('/documents')} />

  return (
    <div className="container">
      <div className="card">
        <h2>{TITLE[doc.type]}の作成</h2>
        <div className="grid2">
          <label className="field"><span>宛名</span>
            <input value={doc.clientName} onChange={e => set('clientName', e.target.value)} placeholder="株式会社〇〇" /></label>
          <label className="field"><span>敬称</span>
            <select value={doc.honorific} onChange={e => set('honorific', e.target.value)}>
              <option>御中</option><option>様</option>
            </select></label>
          <label className="field"><span>発行日</span>
            <input value={doc.date} onChange={e => set('date', e.target.value)} /></label>
          <label className="field"><span>書類No</span>
            <input value={doc.docNo} onChange={e => set('docNo', e.target.value)} /></label>
          {doc.type !== 'letter' && (
            <label className="field"><span>工事名</span>
              <input value={doc.workName} onChange={e => set('workName', e.target.value)} placeholder="内装工事" /></label>
          )}
          {(doc.type === 'estimate' || doc.type === 'invoice') && (
            <label className="field"><span>工事場所</span>
              <input value={doc.siteAddr} onChange={e => set('siteAddr', e.target.value)} /></label>
          )}
          {doc.type === 'estimate' && (
            <label className="field"><span>見積有効期限</span>
              <input value={doc.validUntil} onChange={e => set('validUntil', e.target.value)} /></label>
          )}
        </div>

        {(doc.type === 'estimate' || doc.type === 'invoice') && (
          <>
            <table className="items" style={{ marginTop: 8 }}>
              <thead><tr><th>内容</th><th style={{width:70}}>数量</th><th style={{width:70}}>単位</th><th style={{width:110}}>単価</th><th style={{width:110}}>金額(一式)</th><th style={{width:44}}></th></tr></thead>
              <tbody>
                {doc.items.map((it, i) => (
                  <tr key={i}>
                    <td><input value={it.detail} onChange={e => setItem(i, 'detail', e.target.value)} /></td>
                    <td><input type="number" value={it.qty} onChange={e => setItem(i, 'qty', e.target.value)} /></td>
                    <td><input value={it.unit} onChange={e => setItem(i, 'unit', e.target.value)} /></td>
                    <td><input type="number" value={it.price} onChange={e => setItem(i, 'price', e.target.value)} /></td>
                    <td><input type="number" value={it.amount ?? ''} onChange={e => setItem(i, 'amount', e.target.value)} placeholder="一式のみ" /></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => delRow(i)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={addRow}>＋ 行を追加</button>
            <p style={{ textAlign: 'right', marginTop: 8 }}>
              小計 {yen(totals.subtotal)}　消費税 {yen(totals.tax)}　<strong>合計 {yen(totals.total)}</strong>
            </p>
            <label className="field"><span>備考</span>
              <textarea rows={2} value={doc.remark} onChange={e => set('remark', e.target.value)} /></label>
          </>
        )}

        {doc.type === 'receipt' && (
          <div className="grid2">
            <label className="field"><span>領収金額（税込）</span>
              <input type="number" value={doc.amount} onChange={e => set('amount', e.target.value)} /></label>
            <label className="field"><span>但し書き（◯◯代として）</span>
              <input value={doc.tadashi} onChange={e => set('tadashi', e.target.value)} placeholder="内装工事" /></label>
          </div>
        )}

        {doc.type === 'letter' && (
          <>
            <label className="field"><span>件名</span>
              <input value={doc.subject} onChange={e => set('subject', e.target.value)} placeholder="工事施工のご案内" /></label>
            <label className="field"><span>本文</span>
              <textarea rows={6} value={doc.body} onChange={e => set('body', e.target.value)}
                placeholder={'拝啓　時下ますますご清栄のこととお慶び申し上げます。\n\nさて、このたびは下記の通りご案内申し上げます。'} /></label>
            <label className="field"><span>記（任意・1行1項目）</span>
              <textarea rows={3} value={doc.ki} onChange={e => set('ki', e.target.value)}
                placeholder={'１．工事場所　：大阪市〇〇区\n２．工事期間　：6/20〜7/10'} /></label>
          </>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={persist}>保存してプレビュー</button>
          <button className="btn btn-ghost" onClick={() => nav('/documents')}>戻る</button>
        </div>
      </div>
    </div>
  )
}

function DocPreview({ doc, totals, company, onEdit, onBack }) {
  return (
    <div className="container">
      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => window.print()}>印刷 / PDF保存</button>
        <button className="btn btn-ghost" onClick={onEdit}>編集に戻る</button>
        <button className="btn btn-ghost" onClick={onBack}>一覧へ</button>
      </div>
      <div className="doc-sheet">
        <h1 className="doc-title">{TITLE[doc.type]}</h1>
        <div className="doc-head">
          <div className="doc-client">{doc.clientName}　{doc.honorific}</div>
          <div>
            <div className="doc-meta">発行日：{doc.date}<br />No. {doc.docNo}</div>
            <div className="doc-company">
              <div className="co-name">{company.name || '（設定→会社情報を入力）'}</div>
              {company.addr}<br />{company.tel && `TEL: ${company.tel}`}
              {company.invoiceNo && <><br />登録番号: {company.invoiceNo}</>}
            </div>
          </div>
        </div>

        {(doc.type === 'estimate' || doc.type === 'invoice') && (
          <>
            <p>下記の通り御{doc.type === 'estimate' ? '見積' : '請求'}申し上げます。</p>
            {doc.workName && <p>工事名：{doc.workName}{doc.siteAddr && `　／　工事場所：${doc.siteAddr}`}</p>}
            <div className="doc-total">合計金額　{yen(totals.total)}（税込）</div>
            {doc.type === 'estimate' && doc.validUntil && <p style={{fontSize:12}}>見積有効期限：{doc.validUntil}</p>}
            <table className="doc-items">
              <thead><tr><th>内容</th><th>数量</th><th>単位</th><th>単価</th><th>金額</th></tr></thead>
              <tbody>
                {doc.items.filter(it => it.detail).map((it, i) => (
                  <tr key={i}>
                    <td>{it.detail}</td>
                    <td className="num">{it.qty}</td>
                    <td>{it.unit}</td>
                    <td className="num">{it.price && yen(it.price)}</td>
                    <td className="num">{yen(it.amount != null && it.amount !== '' ? it.amount : Number(it.qty || 0) * Number(it.price || 0))}</td>
                  </tr>
                ))}
                <tr><td colSpan={4} style={{textAlign:'right'}}>小計</td><td className="num">{yen(totals.subtotal)}</td></tr>
                <tr><td colSpan={4} style={{textAlign:'right'}}>消費税（{doc.taxRate}%）</td><td className="num">{yen(totals.tax)}</td></tr>
                <tr><td colSpan={4} style={{textAlign:'right'}}><strong>合計</strong></td><td className="num"><strong>{yen(totals.total)}</strong></td></tr>
              </tbody>
            </table>
            {doc.remark && <p className="doc-remark">備考：{doc.remark}</p>}
            {doc.type === 'invoice' && company.bank && (
              <p className="doc-remark">お振込先：{company.bank}</p>
            )}
          </>
        )}

        {doc.type === 'receipt' && (
          <>
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <div className="doc-total" style={{ fontSize: 26, padding: '12px 40px' }}>{yen(totals.total)} −</div>
              <p>但し　{doc.tadashi || doc.workName}代として</p>
              <p style={{ marginTop: 12 }}>上記正に領収いたしました。</p>
            </div>
            <p style={{ fontSize: 12, textAlign: 'right' }}>
              （内訳）税抜金額 {yen(totals.subtotal)}　消費税（{doc.taxRate}%） {yen(totals.tax)}
            </p>
          </>
        )}

        {doc.type === 'letter' && (
          <>
            <h2 style={{ textAlign: 'center', borderTop: '1px solid #111', borderBottom: '1px solid #111', padding: '6px 0', margin: '16px 0', fontSize: 17 }}>{doc.subject}</h2>
            <div className="doc-letter-body">{doc.body}</div>
            <p style={{ textAlign: 'right' }}>敬具</p>
            {doc.ki && (
              <>
                <div className="doc-ki">記</div>
                <div className="doc-ki-body">{doc.ki}</div>
                <p style={{ textAlign: 'right', marginTop: 12 }}>以上</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
