import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rsefzvesepznxozgidcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWZ6dmVzZXB6bnhvemdpZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzg5MDYsImV4cCI6MjA4ODc1NDkwNn0.cCicEjXYvYHsrDPCsOVq6G33q1PBxYsf7xvcMeO0UKA'
)

const card = {
  background: 'rgba(19,36,32,0.8)',
  border: '1px solid rgba(18,160,143,0.15)',
  borderRadius: '12px',
  padding: '1.2rem'
}

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, rdv: 0 })
  const [rdvList, setRdvList] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [joursRestants, setJoursRestants] = useState(null)
  const [abonnementStatut, setAbonnementStatut] = useState('essai')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.email.split('@')[0])
        fetchData(user.id)
        fetchAbonnement(user.email)
      }
    })
  }, [])

  async function fetchAbonnement(email) {
    const { data } = await supabase
      .from('cliniques')
      .select('date_expiration, plan_actif, abonnement_statut')
      .eq('email', email)
      .single()

    if (data) {
      setAbonnementStatut(data.abonnement_statut || 'essai')
      if (data.date_expiration) {
        const diff = new Date(data.date_expiration) - new Date()
        const jours = Math.ceil(diff / (1000 * 60 * 60 * 24))
        setJoursRestants(jours)
      }
    }
  }

  async function fetchData(uid) {
    const [{ count: nbPatients }, { count: nbRdv }, { data: rdvData }] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('rendez_vous').select('*', { count: 'exact', head: true }).eq('user_id', uid),
      supabase.from('rendez_vous').select('*, patients(nom, prenom)').eq('user_id', uid).limit(5).order('date_heure', { ascending: true })
    ])
    setStats({ patients: nbPatients || 0, rdv: nbRdv || 0 })
    setRdvList(rdvData || [])
    setLoading(false)
  }

  const bars = [35, 55, 40, 75, 60, 90, 70]
  const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const kpis = [
    { label: 'Total Patients', value: stats.patients, icon: '👥', color: '#C8973A', delta: 'Vos patients' },
    { label: 'Rendez-vous', value: stats.rdv, icon: '📅', color: '#7C3AED', delta: 'Total' },
    { label: 'Recettes (DZD)', value: '—', icon: '💰', color: '#059669', delta: 'Bientôt disponible' },
    { label: 'Satisfaction', value: '98%', icon: '⭐', color: '#12A08F', delta: 'Excellent' },
  ]

  // Bannière d'essai
  const renderBanniere = () => {
    if (abonnementStatut === 'actif') return null

    if (joursRestants === null) return null

    if (joursRestants <= 0) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, rgba(229,115,115,0.15), rgba(229,115,115,0.05))',
          border: '1px solid rgba(229,115,115,0.3)',
          borderRadius: '12px', padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 600, color: '#E57373', marginBottom: '0.2rem' }}>
              ⚠️ Votre essai gratuit est expiré
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8BBDB5' }}>
              Souscrivez maintenant pour continuer à utiliser DentaCloud
            </div>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #0A7C6E, #12A08F)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '0.7rem 1.5rem', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}>
            🚀 Souscrire maintenant
          </button>
        </div>
      )
    }

    if (joursRestants <= 7) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, rgba(200,151,58,0.15), rgba(200,151,58,0.05))',
          border: '1px solid rgba(200,151,58,0.3)',
          borderRadius: '12px', padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div style={{ fontWeight: 600, color: '#E8B55A', marginBottom: '0.2rem' }}>
              ⏳ Plus que {joursRestants} jour{joursRestants > 1 ? 's' : ''} d'essai gratuit
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8BBDB5' }}>
              Souscrivez avant expiration pour ne pas perdre vos données
            </div>
          </div>
          <button style={{
            background: 'linear-gradient(135deg, #C8973A, #E8B55A)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '0.7rem 1.5rem', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}>
            Souscrire →
          </button>
        </div>
      )
    }

    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(18,160,143,0.1), rgba(18,160,143,0.05))',
        border: '1px solid rgba(18,160,143,0.2)',
        borderRadius: '12px', padding: '0.8rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ fontSize: '0.82rem', color: '#8BBDB5' }}>
          🎉 Essai gratuit — <strong style={{ color: '#12A08F' }}>{joursRestants} jours restants</strong>
        </div>
        <button style={{
          background: 'transparent', color: '#12A08F',
          border: '1px solid rgba(18,160,143,0.3)',
          borderRadius: '6px', padding: '0.3rem 0.8rem',
          cursor: 'pointer', fontSize: '0.75rem',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Voir les plans →
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          Bonjour, {userName} 👋
        </h1>
        <p style={{ color: '#8BBDB5', fontSize: '0.875rem' }}>Voici un aperçu de votre activité</p>
      </div>

      {/* Bannière essai */}
      {renderBanniere()}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...card, transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</span>
              <span style={{ fontSize: '1.3rem' }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.4rem' }}>
              {loading ? '...' : k.value}
            </div>
            <div style={{ fontSize: '0.68rem', color: k.color }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={card}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Activité — 7 derniers jours
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${h}%`, background: i === 5 ? 'linear-gradient(to top, #C8973A, #E8B55A)' : 'linear-gradient(to top, #0A7C6E, #12A08F)', opacity: i === 5 ? 1 : 0.75 }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {jours.map((j, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem', color: i === 5 ? '#C8973A' : '#8BBDB5' }}>{j}</div>
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Types de soins
          </div>
          {[
            { label: 'Détartrage', pct: 40, color: '#12A08F' },
            { label: 'Carie / Obturations', pct: 30, color: '#C8973A' },
            { label: 'Orthodontie', pct: 20, color: '#7C3AED' },
            { label: 'Autres', pct: 10, color: '#8BBDB5' },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                <span>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.pct}%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px' }}>
                <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '100px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RDV */}
      <div style={{ ...card, padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.2rem', borderBottom: '1px solid rgba(18,160,143,0.1)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Derniers rendez-vous</span>
          <span style={{ background: 'rgba(18,160,143,0.15)', color: '#12A08F', fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>{stats.rdv} total</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '500px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.65rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Patient</span><span>Date</span><span>Type de soin</span><span>Statut</span>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8BBDB5' }}>Chargement...</div>
            ) : rdvList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8BBDB5' }}>
                💡 Ajoutez des rendez-vous dans la section Agenda
              </div>
            ) : rdvList.map((rdv, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.6rem 1rem', borderTop: '1px solid rgba(18,160,143,0.05)', fontSize: '0.78rem', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(18,160,143,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontWeight: 500 }}>{rdv.patients ? `${rdv.patients.prenom} ${rdv.patients.nom}` : 'Patient'}</span>
                <span style={{ color: '#8BBDB5', fontSize: '0.7rem' }}>{new Date(rdv.date_heure).toLocaleDateString('fr-DZ')}</span>
                <span style={{ color: '#8BBDB5' }}>{rdv.type_soin || '—'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 500, background: rdv.statut === 'confirme' ? 'rgba(76,175,138,0.15)' : 'rgba(200,151,58,0.15)', color: rdv.statut === 'confirme' ? '#4CAF8A' : '#E8B55A', width: 'fit-content' }}>
                  ● {rdv.statut === 'confirme' ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}