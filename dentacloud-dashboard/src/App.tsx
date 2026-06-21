import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Agenda from './pages/Agenda'
import Facturation from './pages/Facturation'
import Login from './pages/Login'
import Parametres from './pages/Parametres'
import Stock from './pages/Stock'

// ═══════════════════════════════════════════════════════════════════════════
// Supabase client is imported from src/lib/supabaseClient.js — this is the
// single source of truth.  Do NOT call createClient() in any other file.
// ═══════════════════════════════════════════════════════════════════════════

const menuItems = [
  { path: '/', icon: '📊', label: 'Tableau de bord' },
  { path: '/agenda', icon: '📅', label: 'Agenda' },
  { path: '/patients', icon: '👥', label: 'Patients' },
  { path: '/facturation', icon: '💰', label: 'Facturation' },
  { path: '/parametres', icon: '⚙️', label: 'Paramètres' },
  { path: '/stock', icon: '💊', label: 'Stock' },
]

function BottomNav() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,31,28,0.98)',
      borderTop: '1px solid rgba(18,160,143,0.2)',
      display: 'flex',
      backdropFilter: 'blur(20px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {menuItems.map(item => (
        <NavLink key={item.path} to={item.path} end={item.path === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '0.7rem 0.2rem',
            textDecoration: 'none',
            color: isActive ? '#12A08F' : '#8BBDB5',
            background: isActive ? 'rgba(18,160,143,0.08)' : 'transparent',
            transition: 'all 0.2s', gap: '3px',
            borderTop: isActive ? '2px solid #12A08F' : '2px solid transparent',
          })}>
          <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}

function Sidebar({ sidebarOpen, setSidebarOpen, userEmail, handleLogout }: {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userEmail: string;
  handleLogout: () => Promise<void>
}) {
  const initiales = userEmail.substring(0, 2).toUpperCase()
  return (
    <div style={{
      width: sidebarOpen ? '220px' : '64px',
      background: 'rgba(19,36,32,0.98)',
      borderRight: '1px solid rgba(18,160,143,0.15)',
      transition: 'width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '1.2rem 1rem',
        borderBottom: '1px solid rgba(18,160,143,0.15)',
        display: 'flex', alignItems: 'center',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        minHeight: '60px',
      }}>
        {sidebarOpen && (
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Denta<span style={{ color: '#12A08F' }}>Cloud</span>
          </span>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          background: 'rgba(18,160,143,0.1)', border: 'none', color: '#8BBDB5',
          width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>{sidebarOpen ? '◀' : '▶'}</button>
      </div>

      <nav style={{ padding: '0.8rem 0', flex: 1, overflowY: 'auto' }}>
        {menuItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: sidebarOpen ? '0.8rem' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: '0.75rem 1rem',
              textDecoration: 'none',
              color: isActive ? '#12A08F' : '#8BBDB5',
              background: isActive ? 'rgba(18,160,143,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid #12A08F' : '3px solid transparent',
              transition: 'all 0.2s', fontSize: '0.875rem',
              fontWeight: 500, whiteSpace: 'nowrap',
            })}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(18,160,143,0.15)' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '0.6rem',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          marginBottom: sidebarOpen ? '0.8rem' : '0',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(18,160,143,0.2)',
            border: '1px solid rgba(18,160,143,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 600, color: '#12A08F', flexShrink: 0,
          }}>{initiales}</div>
          {sidebarOpen && (
            <div style={{ fontSize: '0.72rem', color: '#8BBDB5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </div>
          )}
        </div>
        {sidebarOpen && (
          <button onClick={handleLogout} style={{
            width: '100%', padding: '0.5rem',
            background: 'rgba(229,115,115,0.1)',
            border: '1px solid rgba(229,115,115,0.2)',
            color: '#E57373', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif",
          }}>
            🚪 Déconnexion
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Blocage d'accès quand l'essai gratuit est expiré
// ═══════════════════════════════════════════════════════════════════════════
function EcranExpire({ handleLogout }: { handleLogout: () => Promise<void> }) {
  function souscrire() {
    const msg = "Bonjour DentaCloud ! Mon essai gratuit est expire, je voudrais souscrire a un plan."
    window.open(`https://wa.me/213775538234?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0D1F1C', color: '#F0F9F7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(19,36,32,0.95)', border: '1px solid rgba(229,115,115,0.3)',
        borderRadius: '20px', padding: '3rem 2rem', maxWidth: '480px', width: '100%',
        textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏰</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.8rem', color: '#E57373' }}>
          Votre essai gratuit est expiré
        </h2>
        <p style={{ color: '#8BBDB5', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Souscrivez à un plan DentaCloud pour continuer à accéder à votre dashboard, vos patients, et toutes vos données.
        </p>
        <button onClick={souscrire} style={{
          width: '100%', background: 'linear-gradient(135deg, #0A7C6E, #12A08F)',
          color: '#fff', border: 'none', borderRadius: '10px', padding: '1rem',
          fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', fontWeight: 600,
          cursor: 'pointer', marginBottom: '1rem',
        }}>
          🚀 Souscrire via WhatsApp
        </button>
        <button onClick={handleLogout} style={{
          width: '100%', background: 'transparent', color: '#8BBDB5',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.8rem',
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', cursor: 'pointer',
        }}>
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768)
  const [abonnementExpire, setAbonnementExpire] = useState(false)
  const [checkingAbonnement, setCheckingAbonnement] = useState(true)

  useEffect(() => {
    const updateLayout = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }
    window.addEventListener('resize', updateLayout)
    updateLayout()
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data }) => {
        window.history.replaceState({}, '', window.location.pathname)
        setSession(data.session)
        setLoading(false)
      })
      return
    }

    if (params.get('nouveau') === '1') {
      supabase.auth.signOut().then(() => {
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

  // Vérifier le statut d'abonnement à chaque connexion
  useEffect(() => {
    if (!session?.user) {
      setCheckingAbonnement(false)
      return
    }

    setCheckingAbonnement(true)
    supabase
      .from('cliniques')
      .select('date_expiration, abonnement_statut, plan_actif')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const statutActif = data.abonnement_statut === 'actif'
          if (statutActif) {
            setAbonnementExpire(false)
          } else if (data.date_expiration) {
            const expire = new Date(data.date_expiration).getTime() < new Date().getTime()
            setAbonnementExpire(expire)
          } else {
            setAbonnementExpire(false)
          }
        } else {
          // Aucune entrée trouvée : pas de blocage par défaut
          setAbonnementExpire(false)
        }
        setCheckingAbonnement(false)
      })
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  const handleLoginRefetch = useCallback(() =>
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
  , [setSession])

  if (loading || checkingAbonnement) return (
    <div style={{
      minHeight: '100vh', background: '#0D1F1C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#12A08F',
    }}>
      Denta<span style={{ color: '#F0F9F7' }}>Cloud</span>
    </div>
  )

  if (!session) return (
    <Login onLogin={handleLoginRefetch} />
  )

  // Bloquer l'accès si l'abonnement est expiré
  if (abonnementExpire) return (
    <EcranExpire handleLogout={handleLogout} />
  )

  const userEmail = session.user?.email ?? ''

  return (
    <BrowserRouter>
      <div style={{
        display: 'flex', minHeight: '100vh',
        background: '#0D1F1C', color: '#F0F9F7',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userEmail={userEmail}
            handleLogout={handleLogout}
          />
        )}

        {/* Main content */}
        <div style={{
          flex: 1,
          marginLeft: isMobile ? 0 : (sidebarOpen ? '220px' : '64px'),
          transition: 'margin-left 0.3s ease',
          paddingBottom: isMobile ? '70px' : 0,
          minWidth: 0,
          width: isMobile ? '100%' : 'auto',
        }}>
          {/* Topbar */}
          <div style={{
            padding: '0.8rem 1rem',
            borderBottom: '1px solid rgba(18,160,143,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(13,31,28,0.95)', backdropFilter: 'blur(10px)',
            position: 'sticky', top: 0, zIndex: 40,
          }}>
            <div>
              {isMobile
                ? <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 700 }}>
                    Denta<span style={{ color: '#12A08F' }}>Cloud</span>
                  </span>
                : <span style={{ color: '#8BBDB5', fontSize: '0.875rem' }}>
                    {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
              }
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</span>
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#C8973A', color: '#fff', fontSize: '0.55rem',
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                }}>3</span>
              </div>
              {isMobile
                ? <button onClick={handleLogout} style={{
                    background: 'rgba(229,115,115,0.1)',
                    border: '1px solid rgba(229,115,115,0.2)',
                    color: '#E57373', borderRadius: '8px',
                    padding: '0.3rem 0.7rem', fontSize: '0.72rem',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  }}>🚪</button>
                : <div style={{
                    background: 'rgba(18,160,143,0.1)',
                    border: '1px solid rgba(18,160,143,0.2)',
                    borderRadius: '100px', padding: '0.3rem 0.8rem',
                    fontSize: '0.75rem', color: '#12A08F',
                  }}>● En ligne</div>
              }
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/facturation" element={<Facturation />} />
              <Route path="/parametres" element={<Parametres />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        {isMobile && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}
