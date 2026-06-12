import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Documents from './pages/Documents.jsx'
import DocEditor from './pages/DocEditor.jsx'
import Nippo from './pages/Nippo.jsx'
import Photos from './pages/Photos.jsx'
import Chat from './pages/Chat.jsx'
import Settings from './pages/Settings.jsx'
import Success from './pages/Success.jsx'

export default function App() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
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
