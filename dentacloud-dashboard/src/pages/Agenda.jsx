import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rsefzvesepznxozgidcr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWZ6dmVzZXB6bnhvemdpZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzg5MDYsImV4cCI6MjA4ODc1NDkwNn0.cCicEjXYvYHsrDPCsOVq6G33q1PBxYsf7xvcMeO0UKA'
)

const card = { background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '12px' }
const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F0F9F7', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', outline: 'none', width: '100%' }
const SOINS = ['Détartrage', 'Carie / Obturation', 'Extraction', 'Orthodontie', 'Blanchiment', 'Radiographie', 'Consultation', 'Autre']

export default function Agenda() {
  const [rdvs, setRdvs] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patient_id: '', date_heure: '', type_soin: 'Consultation', statut: 'en_attente' })
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); fetchAll(user.id) }
    })
  }, [])

  async function fetchAll(uid) {
    const [{ data: rdvData }, { data: patData }] = await Promise.all([
      supabase.from('rendez_vous').select('*, patients(nom, prenom)').eq('user_id', uid).order('date_heure', { ascending: true }),
      supabase.from('patients').select('id, nom, prenom').eq('user_id', uid).order('nom')
    ])
    setRdvs(rdvData || [])
    setPatients(patData || [])
    setLoading(false)
  }

  async function ajouterRdv() {
    if (!form.patient_id || !form.date_heure) return
    setSaving(true)
    await supabase.from('rendez_vous').insert([{ ...form, user_id: userId }])
    setForm({ patient_id: '', date_heure: '', type_soin: 'Consultation', statut: 'en_attente' })
    setShowForm(false)
    setSaving(false)
    fetchAll(userId)
  }

  async function changerStatut(id, statut) {
    await supabase.from('rendez_vous').update({ statut }).eq('id', id)
    fetchAll(userId)
  }

  async function supprimerRdv(id) {
    if (!confirm('Supprimer ce rendez-vous ?')) return
    await supabase.from('rendez_vous').delete().eq('id', id)
    fetchAll(userId)
  }

  const statusColor = {
    confirme: { bg: 'rgba(76,175,138,0.15)', color: '#4CAF8A' },
    en_attente: { bg: 'rgba(200,151,58,0.15)', color: '#E8B55A' },
    termine: { bg: 'rgba(139,189,181,0.1)', color: '#8BBDB5' }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700 }}>Agenda</h1>
          <p style={{ color: '#8BBDB5', fontSize: '0.875rem', marginTop: '0.2rem' }}>{rdvs.length} rendez-vous</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.4rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>+ Nouveau RDV</button>
      </div>

      {showForm && (
        <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(18,160,143,0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Nouveau rendez-vous</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Patient *</label>
              <select style={{ ...inp, background: '#132420' }} value={form.patient_id} onChange={e => setForm({ ...form, patient_id: e.target.value })}>
                <option value="">Choisir un patient...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Date et heure *</label>
              <input style={inp} type="datetime-local" value={form.date_heure} onChange={e => setForm({ ...form, date_heure: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Type de soin</label>
              <select style={{ ...inp, background: '#132420' }} value={form.type_soin} onChange={e => setForm({ ...form, type_soin: e.target.value })}>
                {SOINS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Statut</label>
              <select style={{ ...inp, background: '#132420' }} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option value="en_attente">En attente</option>
                <option value="confirme">Confirmé</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button onClick={ajouterRdv} disabled={saving} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Enregistrement...' : '✓ Enregistrer'}</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#8BBDB5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ ...card, overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 120px', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.65rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(18,160,143,0.1)' }}>
            <span>Patient</span><span>Date & Heure</span><span>Type de soin</span><span>Statut</span><span>Actions</span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>Chargement...</div>
          ) : rdvs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>Aucun rendez-vous — cliquez sur "+ Nouveau RDV"</div>
          ) : rdvs.map((rdv, i) => {
            const s = statusColor[rdv.statut] || statusColor.en_attente
            return (
              <div key={rdv.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 120px', gap: '0.5rem', padding: '0.8rem 1rem', borderTop: i > 0 ? '1px solid rgba(18,160,143,0.05)' : 'none', fontSize: '0.82rem', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(18,160,143,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontWeight: 500 }}>{rdv.patients ? `${rdv.patients.prenom} ${rdv.patients.nom}` : 'Patient'}</span>
                <span style={{ color: '#8BBDB5', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {new Date(rdv.date_heure).toLocaleDateString('fr-DZ')} {new Date(rdv.date_heure).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ color: '#8BBDB5' }}>{rdv.type_soin || '—'}</span>
                <select value={rdv.statut} onChange={e => changerStatut(rdv.id, e.target.value)} style={{ background: s.bg, color: s.color, border: 'none', borderRadius: '100px', padding: '0.2rem 0.5rem', fontSize: '0.68rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmé</option>
                  <option value="termine">Terminé</option>
                </select>
                <button onClick={() => supprimerRdv(rdv.id)} style={{ background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.2)', color: '#E57373', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>🗑️ Supprimer</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
