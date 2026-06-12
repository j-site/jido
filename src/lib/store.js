// localStorage / IndexedDB ベースの簡易ストア
const LS = window.localStorage

export const load = (key, fallback) => {
  try { return JSON.parse(LS.getItem(`jido:${key}`)) ?? fallback } catch { return fallback }
}
export const save = (key, value) => LS.setItem(`jido:${key}`, JSON.stringify(value))

export const yen = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP')

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

// 書類No: 接頭辞 + YYMMDD + 3桁連番
export const nextDocNo = (prefix, docs) => {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const seqs = docs
    .filter(x => x.docNo?.startsWith(prefix + ymd))
    .map(x => parseInt(x.docNo.slice(-3), 10) || 0)
  return `${prefix}${ymd}${String(Math.max(0, ...seqs) + 1).padStart(3, '0')}`
}

export const calcItems = (items, taxRate = 10) => {
  const subtotal = items.reduce((s, it) =>
    s + (it.amount != null && it.amount !== '' ? Number(it.amount) : Number(it.qty || 0) * Number(it.price || 0)), 0)
  const tax = Math.floor(subtotal * taxRate / 100)
  return { subtotal, tax, total: subtotal + tax }
}

// ===== IndexedDB(写真) =====
const DB_NAME = 'jido-photos'
const openDB = () => new Promise((res, rej) => {
  const req = indexedDB.open(DB_NAME, 1)
  req.onupgradeneeded = () => req.result.createObjectStore('photos', { keyPath: 'id', autoIncrement: true })
  req.onsuccess = () => res(req.result)
  req.onerror = () => rej(req.error)
})
export const addPhoto = async (rec) => {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction('photos', 'readwrite')
    tx.objectStore('photos').add(rec)
    tx.oncomplete = res; tx.onerror = () => rej(tx.error)
  })
}
export const listPhotos = async () => {
  const db = await openDB()
  return new Promise((res, rej) => {
    const req = db.transaction('photos').objectStore('photos').getAll()
    req.onsuccess = () => res(req.result.reverse())
    req.onerror = () => rej(req.error)
  })
}
export const deletePhoto = async (id) => {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction('photos', 'readwrite')
    tx.objectStore('photos').delete(id)
    tx.oncomplete = res; tx.onerror = () => rej(tx.error)
  })
}
