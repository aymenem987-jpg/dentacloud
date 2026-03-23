import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Agenda from './pages/Agenda'
import Facturation from './pages/Facturation'
import Login from './pages/Login'

const supabase = createClient(
  'https://rsefzvesepznxozgidcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWZ6dmVzZXB6bnhvemdpZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzg5MDYsImV4cCI6MjA4ODc1NDkwNn0.cCicEjXYvYHsrDPCsOVq6G33q1PBxYsf7xvcMeO0UKA'
)

const menuItems = [
  { path: '/', icon: '📊', label: 'Tableau de bord' },
  { path: '/agenda', icon: '📅', label: 'Agenda' },
  { path: '/patients', icon: '👥', label: 'Patients' },
  { path: '/facturation', icon: '💰', label: 'Facturation' },
]

function BottomNav() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,31,28,0.98)', borderTop: '1px solid rgba(18,160,143,0.2)',
      display: 'flex', backdropFilter: 'blur(20px)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {menuItems.map(item => (
        <NavLink key={item.path} to={item.path} end={item.path === '/'}
          style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '0.6rem 0.2rem', textDecoration: 'none',
            color: isActive ? '#12A08F' : '#8BBDB5',
            background: isActive ? 'rgba(18,160,143,0.08)' : 'transparent',
            transition: 'all 0.2s', gap: '2px'
          })}>
          <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 500, letterSpacing: '0.03em' }}>{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}

function Sidebar({ sidebarOpen, setSidebarOpen, userEmail, handleLogout }) {
  const initiales = userEmail.substring(0, 2).toUpperCase()
  return (
    <div style={{
      width: sidebarOpen ? '220px' : '64px',
      background: 'rgba(19,36,32,0.98)',
      borderRight: '1px solid rgba(18,160,143,0.15)',
      transition: 'width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(18,160,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {sidebarOpen && (
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 700 }}>
            Denta<span style={{ color: '#12A08F' }}>Cloud</span>
          </span>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          background: 'rgba(18,160,143,0.1)', border: 'none', color: '#8BBDB5',
          width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>{sidebarOpen ? '◀' : '▶'}</button>
      </div>

      <nav style={{ padding: '0.8rem 0', flex: 1 }}>
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              padding: '0.7rem 1rem', textDecoration: 'none',
              color: isActive ? '#12A08F' : '#8BBDB5',
              background: isActive ? 'rgba(18,160,143,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #12A08F' : '3px solid transparent',
              transition: 'all 0.2s', fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap'
            })}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(18,160,143,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: sidebarOpen ? '0.8rem' : '0' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(18,160,143,0.2)', border: '1px solid rgba(18,160,143,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#12A08F', flexShrink: 0 }}>{initiales}</div>
          {sidebarOpen && <div style={{ fontSize: '0.72rem', color: '#8BBDB5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>}
        </div>
        {sidebarOpen && (
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.5rem', background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.2)', color: '#E57373', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>
            🚪 Déconnexion
          </button>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Si l'URL contient ?nouveau=1, déconnecter l'utilisateur actuel
    const params = new URLSearchParams(window.location.search)
    if (params.get('nouveau') === '1') {
      supabase.auth.signOut().then(() => {
        // Nettoyer l'URL
        window.history.replaceState({}, '', window.location.pathname)
        setSession(null)
        setLoading(false)
      })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0D1F1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#12A08F' }}>
      Denta<span style={{ color: '#F0F9F7' }}>Cloud</span>
    </div>
  )

  if (!session) return <Login onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />

  const userEmail = session.user.email

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1F1C', color: '#F0F9F7', fontFamily: "'DM Sans', sans-serif" }}>

        {!isMobile && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} userEmail={userEmail} handleLogout={handleLogout} />}

        <div style={{ flex: 1, marginLeft: isMobile ? 0 : (sidebarOpen ? '220px' : '64px'), transition: 'margin-left 0.3s ease', paddingBottom: isMobile ? '70px' : 0 }}>

          <div style={{
            padding: '0.8rem 1rem', borderBottom: '1px solid rgba(18,160,143,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(13,31,28,0.95)', backdropFilter: 'blur(10px)',
            position: 'sticky', top: 0, zIndex: 40
          }}>
            <div>
              {isMobile
                ? <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 700 }}>Denta<span style={{ color: '#12A08F' }}>Cloud</span></span>
                : <span style={{ color: '#8BBDB5', fontSize: '0.875rem' }}>{new Date().toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              }
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</span>
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#C8973A', color: '#fff', fontSize: '0.55rem', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
              </div>
              {isMobile
                ? <button onClick={handleLogout} style={{ background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.2)', color: '#E57373', borderRadius: '8px', padding: '0.3rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>🚪</button>
                : <div style={{ background: 'rgba(18,160,143,0.1)', border: '1px solid rgba(18,160,143,0.2)', borderRadius: '100px', padding: '0.3rem 0.8rem', fontSize: '0.75rem', color: '#12A08F' }}>● En ligne</div>
              }
            </div>
          </div>

          <div style={{ padding: isMobile ? '1rem' : '2rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/facturation" element={<Facturation />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>

        {isMobile && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}