import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// ═══════════════════════════════════════════════════════════════════════════
// Supabase client imported from src/lib/supabaseClient.js
// Do NOT call createClient() in any other file.
// ═══════════════════════════════════════════════════════════════════════════

const card = {
  background: 'rgba(19,36,32,0.8)',
  border: '1px solid rgba(18,160,143,0.15)',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: '#F0F9F7',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

const labelStyle = {
  fontSize: '0.75rem',
  color: '#8BBDB5',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'block',
  marginBottom: '0.4rem',
}

export default function Parametres() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState(null)
  const [form, setForm] = useState({
    nom_clinique: '',
    medecin: '',
    telephone: '',
    whatsapp: '',
    adresse: '',
    wilaya: '',
    email_contact: '',
  })

  async function fetchParams(uid) {
    try {
      const { data, error } = await supabase
        .from('parametres_clinique')
        .select('*')
        .eq('user_id', uid)
        .single()

      if (error && error.code !== 'PGRST116') console.error('Error fetching settings:', error)

      if (data) {
        setForm({
          nom_clinique: data.nom_clinique || '',
          medecin: data.medecin || '',
          telephone: data.telephone || '',
          whatsapp: data.whatsapp || '',
          adresse: data.adresse || '',
          wilaya: data.wilaya || '',
          email_contact: data.email_contact || '',
        })
      }
    } catch (err) {
      console.error('Unexpected error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        fetchParams(user.id)
        setForm(f => ({ ...f, email_contact: user.email }))
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const { data: existing } = await supabase
        .from('parametres_clinique')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('parametres_clinique')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        if (error) { console.error('Error updating settings:', error); alert('Erreur lors de la sauvegarde.'); setSaving(false); return }
      } else {
        const { error } = await supabase
          .from('parametres_clinique')
          .insert([{ ...form, user_id: userId }])
        if (error) { console.error('Error inserting settings:', error); alert('Erreur lors de la sauvegarde.'); setSaving(false); return }
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Unexpected error saving settings:', err)
      alert('Erreur de connexion.')
    }
    setSaving(false)
  }

  const wilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Tizi Ouzou', 'Béjaïa', 'Tlemcen', 'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Biskra', 'Béchar', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tiaret', 'Djelfa', 'Jijel', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Guelma', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane']

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>Chargement...</div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          ⚙️ Paramètres
        </h1>
        <p style={{ color: '#8BBDB5', fontSize: '0.875rem' }}>Configurez les informations de votre clinique</p>
      </div>

      {/* Message succès */}
      {saved && (
        <div style={{ background: 'rgba(76,175,138,0.15)', border: '1px solid rgba(76,175,138,0.3)', borderRadius: '10px', padding: '0.8rem 1.2rem', marginBottom: '1.5rem', color: '#4CAF8A', fontSize: '0.875rem' }}>
          ✅ Paramètres sauvegardés avec succès !
        </div>
      )}

      {/* Infos clinique */}
      <div style={card}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#12A08F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🏥 Informations de la clinique
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nom de la clinique</label>
            <input
              style={inputStyle}
              value={form.nom_clinique}
              onChange={e => setForm({ ...form, nom_clinique: e.target.value })}
              placeholder="Clinique Dentaire Oran"
              onFocus={e => e.target.style.borderColor = '#12A08F'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Nom du médecin</label>
            <input
              style={inputStyle}
              value={form.medecin}
              onChange={e => setForm({ ...form, medecin: e.target.value })}
              placeholder="Dr. Ahmed Benali"
              onFocus={e => e.target.style.borderColor = '#12A08F'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Wilaya</label>
            <select
              style={{ ...inputStyle, background: '#132420' }}
              value={form.wilaya}
              onChange={e => setForm({ ...form, wilaya: e.target.value })}
            >
              <option value="">Choisir...</option>
              {wilayas.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Adresse</label>
            <input
              style={inputStyle}
              value={form.adresse}
              onChange={e => setForm({ ...form, adresse: e.target.value })}
              placeholder="Rue des Fleurs, Oran"
              onFocus={e => e.target.style.borderColor = '#12A08F'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div style={card}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#12A08F', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
          📞 Contact & Communication
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Téléphone</label>
            <input
              style={inputStyle}
              value={form.telephone}
              onChange={e => setForm({ ...form, telephone: e.target.value })}
              placeholder="0550 000 000"
              type="tel"
              onFocus={e => e.target.style.borderColor = '#12A08F'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp (avec indicatif)</label>
            <input
              style={inputStyle}
              value={form.whatsapp}
              onChange={e => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="213550000000"
              onFocus={e => e.target.style.borderColor = '#12A08F'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ fontSize: '0.68rem', color: '#8BBDB5', marginTop: '0.3rem' }}>
              Format : 213XXXXXXXXX (sans le +)
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email de contact</label>
            <input
              style={inputStyle}
              value={form.email_contact}
              onChange={e => setForm({ ...form, email_contact: e.target.value })}
              placeholder="contact@clinique.dz"
              type="email"
              onFocus={e => e.target.style.borderColor = '#12A08F'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        {/* Aperçu WhatsApp */}
        {form.whatsapp && (
          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📱</span>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#4CAF8A', fontWeight: 600 }}>Lien WhatsApp actif</div>
              <a href={`https://wa.me/${form.whatsapp}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#8BBDB5', textDecoration: 'none' }}>
                wa.me/{form.whatsapp} →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saving ? 'rgba(18,160,143,0.4)' : 'linear-gradient(135deg, #0A7C6E, #12A08F)',
          color: '#fff', border: 'none', borderRadius: '10px',
          padding: '0.9rem 2.5rem',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '1rem', fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder les paramètres'}
      </button>
    </div>
  )
}
