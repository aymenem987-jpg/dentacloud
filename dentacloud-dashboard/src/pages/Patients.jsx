import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rsefzvesepznxozgidcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWZ6dmVzZXB6bnhvemdpZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzg5MDYsImV4cCI6MjA4ODc1NDkwNn0.cCicEjXYvYHsrDPCsOVq6G33q1PBxYsf7xvcMeO0UKA'
)

const card = { background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '12px' }
const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F0F9F7', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', outline: 'none', width: '100%' }

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', date_naissance: '' })
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); fetchPatients(user.id) }
    })
  }, [])

  async function fetchPatients(uid) {
    const { data } = await supabase.from('patients').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    setPatients(data || [])
    setLoading(false)
  }

  async function ajouterPatient() {
    if (!form.nom || !form.prenom) return
    setSaving(true)
    await supabase.from('patients').insert([{ ...form, user_id: userId }])
    setForm({ nom: '', prenom: '', telephone: '', date_naissance: '' })
    setShowForm(false)
    setSaving(false)
    fetchPatients(userId)
  }

  async function supprimerPatient(id) {
    if (!confirm('Supprimer ce patient ?')) return
    await supabase.from('patients').delete().eq('id', id)
    fetchPatients(userId)
  }

  const filtered = patients.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.telephone && p.telephone.includes(search))
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700 }}>Patients</h1>
          <p style={{ color: '#8BBDB5', fontSize: '0.875rem', marginTop: '0.2rem' }}>{patients.length} patient{patients.length > 1 ? 's' : ''} enregistré{patients.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg, #0A7C6E, #12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.4rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>+ Nouveau patient</button>
      </div>

      {showForm && (
        <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(18,160,143,0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Nouveau patient</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[['nom', 'Nom *', 'Benali'], ['prenom', 'Prénom *', 'Ahmed'], ['telephone', 'Téléphone', '0550 000 000']].map(([key, label, ph]) => (
              <div key={key}>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                <input style={inp} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Date naissance</label>
              <input style={inp} type="date" value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={ajouterPatient} disabled={saving} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Enregistrement...' : '✓ Enregistrer'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#8BBDB5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input style={{ ...inp, maxWidth: '400px' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un patient..." />
      </div>

      <div style={{ ...card, overflowX: 'auto' }}>
        <div style={{ minWidth: '500px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 60px', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.65rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(18,160,143,0.1)' }}>
            <span>Nom complet</span><span>Téléphone</span><span>Naissance</span><span>Inscrit le</span><span></span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>Chargement...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>
              {search ? 'Aucun patient trouvé' : 'Aucun patient — cliquez sur "+ Nouveau patient"'}
            </div>
          ) : filtered.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 60px', gap: '0.5rem', padding: '0.8rem 1rem', borderTop: i > 0 ? '1px solid rgba(18,160,143,0.05)' : 'none', fontSize: '0.82rem', transition: 'background 0.15s', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(18,160,143,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'rgba(18,160,143,0.2)', border: '1px solid rgba(18,160,143,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#12A08F' }}>
                  {p.prenom?.[0]}{p.nom?.[0]}
                </div>
                <span style={{ fontWeight: 500 }}>{p.prenom} {p.nom}</span>
              </div>
              <span style={{ color: '#8BBDB5' }}>{p.telephone || '—'}</span>
              <span style={{ color: '#8BBDB5' }}>{p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-DZ') : '—'}</span>
              <span style={{ color: '#8BBDB5', fontSize: '0.72rem' }}>{new Date(p.created_at).toLocaleDateString('fr-DZ')}</span>
              <button onClick={() => supprimerPatient(p.id)} style={{ background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.2)', color: '#E57373', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
