import { useState } from 'react'
import { load, save } from '../lib/store.js'
import { getSession, logout } from '../lib/auth.js'

export default function Settings() {
  const [c, setC] = useState(() => load('company', {
    name: '', addr: '', tel: '', invoiceNo: '', bank: '',
  }))
  const [saved, setSaved] = useState(false)
  const set = (k, v) => { setC(x => ({ ...x, [k]: v })); setSaved(false) }

  return (
    <div className="container">
      <div className="card">
        <h2>会社情報（書類に印字されます）</h2>
        <label className="field"><span>会社名 / 屋号</span>
          <input value={c.name} onChange={e => set('name', e.target.value)} placeholder="株式会社〇〇工務店" /></label>
        <label className="field"><span>住所</span>
          <input value={c.addr} onChange={e => set('addr', e.target.value)} /></label>
        <div className="grid2">
          <label className="field"><span>電話番号</span>
            <input value={c.tel} onChange={e => set('tel', e.target.value)} /></label>
          <label className="field"><span>適格請求書 登録番号</span>
            <input value={c.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} placeholder="T1234567890123" /></label>
        </div>
        <label className="field"><span>振込先（請求書に印字）</span>
          <input value={c.bank} onChange={e => set('bank', e.target.value)} placeholder="〇〇銀行 △△支店 普通 1234567" /></label>
        <button className="btn btn-primary" onClick={() => { save('company', c); setSaved(true) }}>保存</button>
        {saved && <span className="badge ok" style={{ marginLeft: 10 }}>保存しました</span>}
      </div>
      <div className="card">
        <h2>ご契約・アカウント</h2>
        <p className="muted">ログイン中：{getSession()?.email || '—'}<br />
          プラン：月額 ¥1,200（税込）<br />
          解約・お支払い方法の変更は、決済時にStripeから届いたメール内のリンクから行えます。<br />
          ※ お支払いが確認できない場合、その月からご利用を停止いたします。</p>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
          onClick={() => { logout(); window.location.href = '/' }}>ログアウト</button>
      </div>
    </div>
  )
}
