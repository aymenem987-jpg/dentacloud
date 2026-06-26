import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// ═══════════════════════════════════════════════════════════════════════════
// Supabase client imported from src/lib/supabaseClient.js
// Do NOT call createClient() in any other file.
//
// RESPONSIVE: sous 700px, la table devient des cartes empilées (1 colonne)
// pour éviter le scroll horizontal sur mobile. Au-dessus de 700px, table normale.
// ═══════════════════════════════════════════════════════════════════════════

interface Patient {
  id: string
  nom: string
  prenom: string
  telephone: string | null
  date_naissance: string | null
  created_at: string
  user_id: string
}

interface FormState {
  nom: string
  prenom: string
  telephone: string
  date_naissance: string
}

const card = { background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '12px' }
const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F0F9F7', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' as const }

const FORM_FIELDS: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: 'nom', label: 'Nom *', placeholder: 'Benali' },
  { key: 'prenom', label: 'Prénom *', placeholder: 'Ahmed' },
  { key: 'telephone', label: 'Téléphone', placeholder: '0550 000 000' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 700)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>({ nom: '', prenom: '', telephone: '', date_naissance: '' })
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  async function fetchPatients(uid: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
      if (error) console.error('Error fetching patients:', error)
      setPatients((data as Patient[]) || [])
    } catch (err) {
      console.error('Unexpected error fetching patients:', err)
      setPatients([])
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); fetchPatients(user.id) }
    })
  }, [])

  async function ajouterPatient() {
    if (!form.nom || !form.prenom || !userId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('patients').insert([{ ...form, user_id: userId }])
      if (error) {
        console.error('Error adding patient:', error)
        alert("Erreur lors de l'ajout du patient.")
        setSaving(false)
        return
      }
      setForm({ nom: '', prenom: '', telephone: '', date_naissance: '' })
      setShowForm(false)
      await fetchPatients(userId)
    } catch (err) {
      console.error('Unexpected error adding patient:', err)
      alert('Erreur de connexion.')
    }
    setSaving(false)
  }

  async function supprimerPatient(id: string) {
    if (!window.confirm('Supprimer ce patient ?') || !userId) return
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id)
      if (error) {
        console.error('Error deleting patient:', error)
        alert('Erreur lors de la suppression.')
        return
      }
      await fetchPatients(userId)
    } catch (err) {
      console.error('Unexpected error deleting patient:', err)
    }
  }

  const filtered = patients.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.telephone && p.telephone.includes(search))
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.6rem, 2.2vw, 2.3rem)', fontWeight: 700 }}>Patients</h1>
          <p style={{ color: '#8BBDB5', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {patients.length} patient{patients.length > 1 ? 's' : ''} enregistré{patients.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg, #0A7C6E, #12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.4rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
          + Nouveau patient
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(18,160,143,0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Nouveau patient</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {FORM_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                  {label}
                </label>
                <input
                  style={inp}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                Date naissance
              </label>
              <input
                style={inp}
                type="date"
                value={form.date_naissance}
                onChange={e => setForm({ ...form, date_naissance: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={ajouterPatient} disabled={saving} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Enregistrement...' : '✓ Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#8BBDB5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input
          style={{ ...inp, maxWidth: isMobile ? '100%' : '400px' }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher un patient..."
        />
      </div>

      {loading ? (
        <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>
          {search ? 'Aucun patient trouvé' : 'Aucun patient — cliquez sur "+ Nouveau patient"'}
        </div>
      ) : isMobile ? (
        /* ── Vue mobile : cartes empilées, pas de scroll horizontal ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filtered.map(p => (
            <div key={p.id} style={{ ...card, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'rgba(18,160,143,0.2)', border: '1px solid rgba(18,160,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#12A08F' }}>
                    {p.prenom?.[0]}{p.nom?.[0]}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{p.prenom} {p.nom}</span>
                </div>
                <button onClick={() => supprimerPatient(p.id)} style={{ background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.2)', color: '#E57373', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  🗑️
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.82rem', color: '#8BBDB5', paddingLeft: '2.8rem' }}>
                <span>📞 {p.telephone || '—'}</span>
                <span>🎂 {p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-DZ') : '—'}</span>
                <span>📅 {new Date(p.created_at).toLocaleDateString('fr-DZ')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Vue desktop : table classique ── */
        <div style={card}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 60px', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.7rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(18,160,143,0.1)' }}>
            <span>Nom complet</span><span>Téléphone</span><span>Naissance</span><span>Inscrit le</span><span></span>
          </div>
          {filtered.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 60px', gap: '0.5rem', padding: '0.8rem 1rem', borderTop: i > 0 ? '1px solid rgba(18,160,143,0.05)' : 'none', fontSize: '0.88rem', transition: 'background 0.15s', alignItems: 'center' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(18,160,143,0.04)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'rgba(18,160,143,0.2)', border: '1px solid rgba(18,160,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#12A08F' }}>
                  {p.prenom?.[0]}{p.nom?.[0]}
                </div>
                <span style={{ fontWeight: 500 }}>{p.prenom} {p.nom}</span>
              </div>
              <span style={{ color: '#8BBDB5' }}>{p.telephone || '—'}</span>
              <span style={{ color: '#8BBDB5' }}>{p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-DZ') : '—'}</span>
              <span style={{ color: '#8BBDB5', fontSize: '0.78rem' }}>{new Date(p.created_at).toLocaleDateString('fr-DZ')}</span>
              <button onClick={() => supprimerPatient(p.id)} style={{ background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.2)', color: '#E57373', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}