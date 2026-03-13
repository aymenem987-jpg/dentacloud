import { useState } from 'react'

const card = { background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '12px' }
const input = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F0F9F7', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', outline: 'none', width: '100%' }

const FACTURES_DEMO = [
  { id: 'FAC-001', patient: 'Ahmed Benali', soin: 'Détartrage', montant: 3500, statut: 'payee', date: '2026-03-10' },
  { id: 'FAC-002', patient: 'Fatima Oukil', soin: 'Carie / Obturation', montant: 8000, statut: 'en_attente', date: '2026-03-09' },
  { id: 'FAC-003', patient: 'Karim Meziane', soin: 'Orthodontie', montant: 45000, statut: 'partielle', date: '2026-03-08' },
  { id: 'FAC-004', patient: 'Nadia Bensalem', soin: 'Extraction', montant: 5000, statut: 'payee', date: '2026-03-07' },
  { id: 'FAC-005', patient: 'Mohamed Cherif', soin: 'Blanchiment', montant: 12000, statut: 'en_attente', date: '2026-03-06' },
]

export default function Facturation() {
  const [factures, setFactures] = useState(FACTURES_DEMO)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patient: '', soin: '', montant: '' })

  const totalPayee = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montant, 0)
  const totalAttente = factures.filter(f => f.statut !== 'payee').reduce((s, f) => s + f.montant, 0)

  function ajouterFacture() {
    if (!form.patient || !form.montant) return
    const newF = {
      id: `FAC-00${factures.length + 1}`,
      patient: form.patient, soin: form.soin,
      montant: parseInt(form.montant), statut: 'en_attente',
      date: new Date().toISOString().split('T')[0]
    }
    setFactures([newF, ...factures])
    setForm({ patient: '', soin: '', montant: '' })
    setShowForm(false)
  }

  function changerStatut(id, statut) {
    setFactures(factures.map(f => f.id === id ? { ...f, statut } : f))
  }

  const statusStyle = {
    payee: { bg: 'rgba(76,175,138,0.15)', color: '#4CAF8A', label: '✓ Payée' },
    en_attente: { bg: 'rgba(200,151,58,0.15)', color: '#E8B55A', label: '⏳ En attente' },
    partielle: { bg: 'rgba(124,58,237,0.15)', color: '#A78BFA', label: '◑ Partielle' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700 }}>Facturation</h1>
          <p style={{ color: '#8BBDB5', fontSize: '0.875rem', marginTop: '0.2rem' }}>Gestion des factures en DZD</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff',
          border: 'none', borderRadius: '8px', padding: '0.7rem 1.4rem',
          fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
        }}>+ Nouvelle facture</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total encaissé', value: `${totalPayee.toLocaleString()} DZD`, color: '#4CAF8A', icon: '✅' },
          { label: 'En attente', value: `${totalAttente.toLocaleString()} DZD`, color: '#E8B55A', icon: '⏳' },
          { label: 'Nb factures', value: factures.length, color: '#12A08F', icon: '🧾' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</span>
              <span style={{ fontSize: '1.3rem' }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(18,160,143,0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Nouvelle facture</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Nom du patient *</label>
              <input style={input} value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })} placeholder="Ahmed Benali" />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Type de soin</label>
              <input style={input} value={form.soin} onChange={e => setForm({ ...form, soin: e.target.value })} placeholder="Détartrage, Carie..." />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Montant (DZD) *</label>
              <input style={input} type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="5000" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={ajouterFacture} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>✓ Créer la facture</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#8BBDB5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 100px', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.65rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(18,160,143,0.1)' }}>
          <span>N° Facture</span><span>Patient</span><span>Soin</span><span>Montant</span><span>Statut</span><span>Date</span>
        </div>

        {factures.map((f, i) => {
          const s = statusStyle[f.statut] || statusStyle.en_attente
          return (
            <div key={f.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 100px', gap: '0.5rem',
              padding: '0.8rem 1rem', borderTop: i > 0 ? '1px solid rgba(18,160,143,0.05)' : 'none',
              fontSize: '0.82rem', alignItems: 'center', transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(18,160,143,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#12A08F' }}>{f.id}</span>
              <span style={{ fontWeight: 500 }}>{f.patient}</span>
              <span style={{ color: '#8BBDB5' }}>{f.soin}</span>
              <span style={{ fontWeight: 600, color: '#F0F9F7' }}>{f.montant.toLocaleString()} <span style={{ fontSize: '0.65rem', color: '#8BBDB5' }}>DZD</span></span>
              <select value={f.statut} onChange={e => changerStatut(f.id, e.target.value)} style={{
                background: s.bg, color: s.color, border: 'none', borderRadius: '100px',
                padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontWeight: 500, cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif"
              }}>
                <option value="en_attente">⏳ En attente</option>
                <option value="payee">✓ Payée</option>
                <option value="partielle">◑ Partielle</option>
              </select>
              <span style={{ fontSize: '0.7rem', color: '#8BBDB5' }}>{new Date(f.date).toLocaleDateString('fr-DZ')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
