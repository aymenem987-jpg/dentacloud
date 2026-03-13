import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Agenda from './pages/Agenda'
import Facturation from './pages/Facturation'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/', icon: '📊', label: 'Tableau de bord' },
    { path: '/agenda', icon: '📅', label: 'Agenda' },
    { path: '/patients', icon: '👥', label: 'Patients' },
    { path: '/facturation', icon: '💰', label: 'Facturation' },
  ]

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1F1C', color: '#F0F9F7', fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? '220px' : '64px',
          background: 'rgba(19,36,32,0.95)',
          borderRight: '1px solid rgba(18,160,143,0.15)',
          transition: 'width 0.3s ease',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
          overflow: 'hidden'
        }}>
          {/* Logo */}
          <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(18,160,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {sidebarOpen && (
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 700 }}>
                Denta<span style={{ color: '#12A08F' }}>Cloud</span>
              </span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: 'rgba(18,160,143,0.1)', border: 'none', color: '#8BBDB5',
              width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Menu */}
          <nav style={{ padding: '0.8rem 0', flex: 1 }}>
            {menuItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.7rem 1rem', textDecoration: 'none',
                  color: isActive ? '#12A08F' : '#8BBDB5',
                  background: isActive ? 'rgba(18,160,143,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #12A08F' : '3px solid transparent',
                  transition: 'all 0.2s', fontSize: '0.875rem', fontWeight: 500,
                  whiteSpace: 'nowrap'
                })}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(18,160,143,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(18,160,143,0.2)', border: '1px solid rgba(18,160,143,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 600, color: '#12A08F', flexShrink: 0
              }}>Dr</div>
              {sidebarOpen && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Dr. Amira</div>
                  <div style={{ fontSize: '0.65rem', color: '#8BBDB5' }}>Clinique Oran</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, marginLeft: sidebarOpen ? '220px' : '64px', transition: 'margin-left 0.3s ease' }}>
          {/* Topbar */}
          <div style={{
            padding: '1rem 2rem', borderBottom: '1px solid rgba(18,160,143,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(13,31,28,0.8)', backdropFilter: 'blur(10px)',
            position: 'sticky', top: 0, zIndex: 40
          }}>
            <div style={{ fontSize: '0.875rem', color: '#8BBDB5' }}>
              {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</span>
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#C8973A', color: '#fff', fontSize: '0.55rem',
                  width: '14px', height: '14px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                }}>3</span>
              </div>
              <div style={{
                background: 'rgba(18,160,143,0.1)', border: '1px solid rgba(18,160,143,0.2)',
                borderRadius: '100px', padding: '0.3rem 0.8rem', fontSize: '0.75rem', color: '#12A08F'
              }}>● En ligne</div>
            </div>
          </div>

          {/* Pages */}
          <div style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/facturation" element={<Facturation />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}