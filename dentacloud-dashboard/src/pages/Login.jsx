import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rsefzvesepznxozgidcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWZ6dmVzZXB6bnhvemdpZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzg5MDYsImV4cCI6MjA4ODc1NDkwNn0.cCicEjXYvYHsrDPCsOVq6G33q1PBxYsf7xvcMeO0UKA'
)

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: '#F0F9F7',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' ou 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
    } else {
      onLogin()
    }
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nom_clinique: nom } }
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Compte créé ! Vous pouvez maintenant vous connecter.')
      setMode('login')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1F1C',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '1rem'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(18,160,143,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(19,36,32,0.95)',
        border: '1px solid rgba(18,160,143,0.2)',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem', fontWeight: 700, marginBottom: '0.3rem'
          }}>
            Denta<span style={{ color: '#12A08F' }}>Cloud</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#8BBDB5' }}>
            Plateforme de gestion dentaire
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px', padding: '4px', marginBottom: '1.5rem'
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
              flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer',
              borderRadius: '6px', fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
              background: mode === m ? 'rgba(18,160,143,0.2)' : 'transparent',
              color: mode === m ? '#12A08F' : '#8BBDB5',
            }}>
              {m === 'login' ? '🔐 Connexion' : '✨ Inscription'}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.3)',
            borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.8rem', color: '#E57373'
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(76,175,138,0.1)', border: '1px solid rgba(76,175,138,0.3)',
            borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.8rem', color: '#4CAF8A'
          }}>✅ {success}</div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                Nom de la clinique
              </label>
              <input
                style={inputStyle}
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Clinique Dentaire Oran"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
              Email
            </label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="dr.amira@clinique.dz"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
              Mot de passe
            </label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.85rem',
            background: loading ? 'rgba(18,160,143,0.4)' : 'linear-gradient(135deg, #0A7C6E, #12A08F)',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}>
            {loading ? '⏳ Chargement...' : mode === 'login' ? '🔐 Se connecter' : '✨ Créer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: '#8BBDB5' }}>
          DentaCloud © 2026 — Algérie 🇩🇿
        </div>
      </div>
    </div>
  )
}