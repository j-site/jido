import { useEffect, useState } from 'react'
import { addPhoto, listPhotos, deletePhoto, today } from '../lib/store.js'

// 長辺1280pxに縮小してIndexedDBへ(容量対策)
const shrink = (file) => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => {
    const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = img.width * scale; c.height = img.height * scale
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
    resolve(c.toDataURL('image/jpeg', 0.8))
    URL.revokeObjectURL(img.src)
  }
  img.src = URL.createObjectURL(file)
})

export default function Photos() {
  const [photos, setPhotos] = useState([])
  const [site, setSite] = useState('')
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = () => listPhotos().then(setPhotos).catch(() => setPhotos([]))
  useEffect(() => { refresh() }, [])

  const onFiles = async (e) => {
    const files = [...e.target.files]
    if (!files.length) return
    setBusy(true)
    for (const f of files) {
      const dataUrl = await shrink(f)
      await addPhoto({ dataUrl, site: site || '未分類', date: today(), name: f.name })
    }
    e.target.value = ''
    setBusy(false)
    refresh()
  }

  const remove = async (id) => {
    if (!confirm('この写真を削除しますか？')) return
    await deletePhoto(id); refresh()
  }

  const sites = [...new Set(photos.map(p => p.site))]
  const shown = filter ? photos.filter(p => p.site === filter) : photos

  return (
    <div className="container">
      <div className="card">
        <h2>現場写真をアップロード</h2>
        <div className="grid2">
          <label className="field"><span>現場名（タグ）</span>
            <input value={site} onChange={e => setSite(e.target.value)} placeholder="〇〇様邸" /></label>
          <label className="field"><span>写真を選択（複数可）</span>
            <input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} /></label>
        </div>
        {busy && <p className="muted">取り込み中…</p>}
        <p className="muted">写真はこの端末内に保存されます（サーバーには送信されません）。</p>
      </div>
      <div className="card">
        <h2>写真一覧（{shown.length}枚）</h2>
        {sites.length > 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <button className={`btn btn-sm ${filter ? 'btn-ghost' : 'btn-navy'}`} onClick={() => setFilter('')}>すべて</button>
            {sites.map(s => (
              <button key={s} className={`btn btn-sm ${filter === s ? 'btn-navy' : 'btn-ghost'}`}
                onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>
        )}
        {shown.length === 0 && <p className="muted">写真がありません。</p>}
        <div className="photo-grid">
          {shown.map(p => (
            <figure key={p.id}>
              <img src={p.dataUrl} alt={p.name} loading="lazy" />
              <button className="del" onClick={() => remove(p.id)}>削除</button>
              <figcaption>{p.site}　{p.date}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
