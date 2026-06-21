import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// ═════════════════════════════════════════════════════════════════════════════
// Supabase client imported from src/lib/supabaseClient.js
// Do NOT call createClient() in any other file.
// ═════════════════════════════════════════════════════════════════════════════

interface Patient {
  id: string
  nom: string
  prenom: string
}

interface RendezVous {
  id: string
  date_heure: string
  type_soin: string
  statut: string
  patient_id: string
  user_id: string
  patients?: Patient
}

const card = { background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '12px' }
const inp = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F0F9F7', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', outline: 'none', width: '100%' }
const SOINS = ['Détartrage', 'Carie / Obturation', 'Extraction', 'Orthodontie', 'Blanchiment', 'Radiographie', 'Consultation', 'Autre']

export default function Agenda() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{ patient_id: string; date_heure: string; type_soin: string; statut: string }>({ patient_id: '', date_heure: '', type_soin: 'Consultation', statut: 'en_attente' })
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  async function fetchAll(uid: string) {
    try {
      const [{ data: rdvData, error: rdvErr }, { data: patData, error: patErr }] = await Promise.all([
        supabase.from('rendez_vous').select('*, patients(nom, prenom)').eq('user_id', uid).order('date_heure', { ascending: true }),
        supabase.from('patients').select('id, nom, prenom').eq('user_id', uid).order('nom')
      ])
      if (rdvErr) console.error('Error fetching rendez-vous:', rdvErr)
      if (patErr) console.error('Error fetching patients:', patErr)
      setRdvs(rdvData || [])
      setPatients(patData || [])
    } catch (err) {
      console.error('Unexpected error in fetchAll:', err)
      setRdvs([]); setPatients([])
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); fetchAll(user.id) }
    })
  }, [])

  async function ajouterRdv() {
    if (!form.patient_id || !form.date_heure) return
    setSaving(true)
    try {
      const { error } = await supabase.from('rendez_vous').insert([{ ...form, user_id: userId }])
      if (error) { console.error('Error adding rendez-vous:', error); alert('Erreur lors de l\'ajout du rendez-vous.'); setSaving(false); return }
      await fetchAll(userId!)
      setShowForm(false)
      setForm({ patient_id: '', date_heure: '', type_soin: 'Consultation', statut: 'en_attente' })
    } catch (err) {
      console.error('Error in ajouterRdv:', err)
      alert('Erreur inattendue.')
    }
    setSaving(false)
  }

  async function supprimerRdv(id: string) {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return
    setSaving(true)
    try {
      const { error } = await supabase.from('rendez_vous').delete().eq('id', id)
      if (error) { console.error('Error deleting rendez-vous:', error); alert('Erreur lors de la suppression.'); setSaving(false); return }
      await fetchAll(userId!)
    } catch (err) {
      console.error('Error in supprimerRdv:', err)
      alert('Erreur inattendue.')
    }
    setSaving(false)
  }

  async function terminerRdv(id: string) {
    setSaving(true)
    try {
      const { error } = await supabase.from('rendez_vous').update({ statut: 'termine' }).eq('id', id)
      if (error) { console.error('Error updating rendez-vous:', error); alert('Erreur lors de la mise à jour.'); setSaving(false); return }
      await fetchAll(userId!)
    } catch (err) {
      console.error('Error in terminerRdv:', err)
      alert('Erreur inattendue.')
    }
    setSaving(false)
  }

  async function confirmerRdv(id: string) {
    setSaving(true)
    try {
      const { error } = await supabase.from('rendez_vous').update({ statut: 'confirme' }).eq('id', id)
      if (error) { console.error('Error updating rendez-vous:', error); alert('Erreur lors de la mise à jour.'); setSaving(false); return }
      await fetchAll(userId!)
    } catch (err) {
      console.error('Error in confirmerRdv:', err)
      alert('Erreur inattendue.')
    }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
      <p>Chargement des données...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0D1F1C', color: '#F0F9F7' }}>
      <div style={{ padding: '1.5rem 2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#12A08F' }}>📅 Agenda</h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowForm(true)} style={{
            background: 'rgba(18,160,143,0.1)', border: '1px solid rgba(18,160,143,0.2)',
            color: '#12A08F', borderRadius: '8px', padding: '0.5rem 1rem',
            cursor: 'pointer', fontSize: '0.875rem',
          }}>+ Nouveau rendez-vous</button>

          <input
            type="text"
            placeholder="Rechercher un patient..."
            style={inp}
            onChange={(e) => {
              const search = e.target.value.toLowerCase()
              const filtered = patients.filter(p =>
                p.nom.toLowerCase().includes(search) ||
                p.prenom.toLowerCase().includes(search)
              )
              setPatients(filtered)
            }}
          />
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div style={{
            background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)',
            borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem',
          }}>
            <h2 style={{ color: '#12A08F', marginBottom: '1rem' }}>Nouveau rendez-vous</h2>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem' }}>Patient</label>
                <select
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  style={{ ...inp, height: '2.5rem' }}
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom} {p.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem' }}>Date et heure</label>
                <input
                  type="datetime-local"
                  value={form.date_heure}
                  onChange={(e) => setForm({ ...form, date_heure: e.target.value })}
                  style={{ ...inp, height: '2.5rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem' }}>Type de soin</label>
                <select
                  value={form.type_soin}
                  onChange={(e) => setForm({ ...form, type_soin: e.target.value })}
                  style={{ ...inp, height: '2.5rem' }}
                >
                  {SOINS.map(soin => (
                    <option key={soin} value={soin.toLowerCase().replace(/[\s\/]/g, '_')}>
                      {soin}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.875rem' }}>Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  style={{ ...inp, height: '2.5rem' }}
                >
                  <option value="en_attente">En attente</option>
                  <option value="confirme">Confirmé</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right', gap: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{
                background: 'rgba(100,100,100,0.1)', border: '1px solid rgba(100,100,100,0.2)',
                color: '#CCCCCC', borderRadius: '6px', padding: '0.4rem 0.8rem',
                cursor: 'pointer', fontSize: '0.875rem',
              }}>Annuler</button>
              <button onClick={ajouterRdv} disabled={saving} style={{
                background: saving ? 'rgba(18,160,143,0.2)' : 'rgba(18,160,143,0.1)',
                border: `1px solid ${saving ? 'rgba(18,160,143,0.3)' : 'rgba(18,160,143,0.2)'}`,
                color: saving ? '#8BBDB5' : '#12A08F', borderRadius: '6px', padding: '0.4rem 0.8rem',
                cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
              }}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Liste des rendez-vous */}
        <div style={{ background: 'rgba(19,36,32,0.6)', borderRadius: '12px', overflow: 'hidden' }}>
          {rdvs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Aucun rendez-vous trouvé.</p>
              {!patients.length && (
                <p style={{ color: '#8BBDB5', marginTop: '0.5rem' }}>Ajoutez des patients dans la section Patients pour commencer.</p>
              )}
            </div>
          ) : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {rdvs.map(rdv => {
                const patientName = rdv.patients ? `${rdv.patients.nom} ${rdv.patients.prenom}` : 'Patient inconnu'
                const statutColors: Record<string, { bg: string; color: string }> = {
                  en_attente: { bg: 'rgba(200,151,58,0.2)', color: '#C8973A' },
                  confirme: { bg: 'rgba(18,160,143,0.2)', color: '#12A08F' },
                  termine: { bg: 'rgba(76,175,80,0.2)', color: '#4CAF50' }
                }
                const statutKey = rdv.statut ?? 'en_attente'
                const statut = statutColors[statutKey] ?? statutColors.en_attente
                const date = new Date(rdv.date_heure)
                const dateStr = date.toLocaleString('fr-FR', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })

                return (
                  <div key={rdv.id} style={{ ...card, margin: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>{patientName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#8BBDB5' }}>{dateStr}</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{
                          background: statut.bg, color: statut.color,
                          borderRadius: '4px', padding: '0.2rem 0.5rem',
                          fontSize: '0.75rem', textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {rdv.statut === 'en_attente' ? 'En attente' :
                            rdv.statut === 'confirme' ? 'Confirmé' : 'Terminé'}
                        </span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#8BBDB5' }}>
                          {rdv.type_soin.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => terminerRdv(rdv.id)} disabled={saving} style={{
                        background: saving ? 'rgba(100,100,100,0.2)' : 'rgba(76,175,80,0.1)',
                        border: `1px solid ${saving ? 'rgba(100,100,100,0.3)' : 'rgba(76,175,80,0.2)'}`,
                        color: saving ? '#CCCCCC' : '#4CAF50', borderRadius: '6px', padding: '0.3rem 0.7rem',
                        cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.75rem',
                      }}>✓ Terminer</button>
                      <button onClick={() => confirmerRdv(rdv.id)} disabled={saving} style={{
                        background: saving ? 'rgba(100,100,100,0.2)' : 'rgba(18,160,143,0.1)',
                        border: `1px solid ${saving ? 'rgba(100,100,100,0.3)' : 'rgba(18,160,143,0.2)'}`,
                        color: saving ? '#CCCCCC' : '#12A08F', borderRadius: '6px', padding: '0.3rem 0.7rem',
                        cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.75rem',
                      }}>✓ Confirmer</button>
                      <button onClick={() => supprimerRdv(rdv.id)} disabled={saving} style={{
                        background: saving ? 'rgba(100,100,100,0.2)' : 'rgba(229,115,115,0.1)',
                        border: `1px solid ${saving ? 'rgba(100,100,100,0.3)' : 'rgba(229,115,115,0.2)'}`,
                        color: saving ? '#CCCCCC' : '#E57373', borderRadius: '6px', padding: '0.3rem 0.7rem',
                        cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.75rem',
                      }}>🗑️ Supprimer</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}