import { useRef, useState } from 'react'

export default function Chat() {
  const [log, setLog] = useState([
    { role: 'assistant', text: 'こんにちは！Jido AIアシスタントです。見積の書き方、工事の段取り、書類の文面など、なんでも聞いてください。' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const nextLog = [...log, { role: 'user', text }]
    setLog(nextLog); setInput(''); setBusy(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextLog.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.text })),
        }),
      })
      const data = await res.json()
      setLog(l => [...l, { role: 'assistant', text: data.text || data.error || 'エラーが発生しました' }])
    } catch {
      setLog(l => [...l, { role: 'assistant', text: '通信エラーが発生しました。時間をおいて再度お試しください。' }])
    } finally {
      setBusy(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="container">
      <div className="card chat-box">
        <div className="chat-log">
          {log.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.text}</div>
          ))}
          {busy && <div className="msg ai">考え中…</div>}
          <div ref={bottomRef} />
        </div>
        <div className="chat-input">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && send()}
            placeholder="例：クロス貼り替えの見積項目を教えて" />
          <button className="btn btn-primary" onClick={send} disabled={busy}>送信</button>
        </div>
      </div>
    </div>
  )
}
