import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isLoggedIn, isTrialExpired, isTrial, trialRemainingMs, ensureTrial } from './lib/auth.js'
import TrialExpired from './pages/TrialExpired.jsx'
import Landing from './pages/Landing.jsx'
import Documents from './pages/Documents.jsx'
import DocEditor from './pages/DocEditor.jsx'
import Nippo from './pages/Nippo.jsx'
import Photos from './pages/Photos.jsx'
import Chat from './pages/Chat.jsx'
import Settings from './pages/Settings.jsx'
import Success from './pages/Success.jsx'

function TrialBanner() {
  const ms = trialRemainingMs()
  if (!isTrial() || ms === 0) return null
  const hours = Math.ceil(ms / 3600000)
  const label = hours > 24 ? `残り${Math.ceil(hours / 24)}日` : `残り約${hours}時間`
  return (
    <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', padding: '6px 16px', fontSize: 13, textAlign: 'center' }}>
      <span style={{ color: '#c2410c', fontWeight: 700 }}>無料トライアル中（{label}）</span>
      <span style={{ color: '#7c3aed', marginLeft: 12 }}>
        終了後は月額¥1,200 —{' '}
        <a href="/success" style={{ textDecoration: 'underline', color: '#7c3aed' }}>今すぐ登録する</a>
      </span>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  const isPublic = isLanding || pathname === '/success'

  // アプリページに来たら即トライアル開始（レンダリング前に同期実行）
  if (!isPublic) ensureTrial()

  const [, forceUpdate] = useState(0)
  const rerender = () => forceUpdate(n => n + 1)

  if (!isPublic) {
    if (isTrialExpired()) return <TrialExpired onUnlock={rerender} />
    if (!isLoggedIn()) return null
  }

  return (
    <>
      {!isLanding && (
        <header className="app-header">
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="Jido" />
            <span className="brand">Jido<small>建設業の事務を、自動に。</small></span>
          </NavLink>
          <nav>
            <NavLink to="/documents">書類</NavLink>
            <NavLink to="/nippo">日報</NavLink>
            <NavLink to="/photos">写真</NavLink>
            <NavLink to="/chat">AIチャット</NavLink>
            <NavLink to="/settings">設定</NavLink>
          </nav>
        </header>
      )}
      {!isLanding && <TrialBanner />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/new/:type" element={<DocEditor />} />
        <Route path="/documents/:id" element={<DocEditor />} />
        <Route path="/nippo" element={<Nippo />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </>
  )
}
