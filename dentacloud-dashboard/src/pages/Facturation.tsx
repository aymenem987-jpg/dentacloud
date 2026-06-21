import { useState, type CSSProperties } from 'react'

const card: CSSProperties = { background: 'rgba(19,36,32,0.8)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '12px' }
const input: CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#F0F9F7', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' }

const SOINS_CNAS = [
  { soin: 'Détartrage', taux: 80 },
  { soin: 'Extraction simple', taux: 80 },
  { soin: 'Obturation amalgame', taux: 80 },
  { soin: 'Prothèse dentaire', taux: 50 },
  { soin: 'Orthodontie', taux: 30 },
  { soin: 'Radiographie', taux: 80 },
]

type Facture = {
  id: string
  patient: string
  soin: string
  montant: number
  statut: string
  date: string
  cnas: boolean
  casnos: boolean
  taux_remb: number
  montant_remb: number
}

const FACTURES_DEMO: Facture[] = [
  { id: 'FAC-001', patient: 'Ahmed Benali', soin: 'Détartrage', montant: 3500, statut: 'payee', date: '2026-03-10', cnas: false, casnos: false, taux_remb: 0, montant_remb: 0 },
  { id: 'FAC-002', patient: 'Fatima Oukil', soin: 'Obturation amalgame', montant: 8000, statut: 'en_attente', date: '2026-03-09', cnas: true, casnos: false, taux_remb: 80, montant_remb: 6400 },
  { id: 'FAC-003', patient: 'Karim Meziane', soin: 'Orthodontie', montant: 45000, statut: 'partielle', date: '2026-03-08', cnas: false, casnos: true, taux_remb: 30, montant_remb: 13500 },
  { id: 'FAC-004', patient: 'Nadia Bensalem', soin: 'Extraction simple', montant: 5000, statut: 'payee', date: '2026-03-07', cnas: true, casnos: false, taux_remb: 80, montant_remb: 4000 },
  { id: 'FAC-005', patient: 'Mohamed Cherif', soin: 'Blanchiment', montant: 12000, statut: 'en_attente', date: '2026-03-06', cnas: false, casnos: false, taux_remb: 0, montant_remb: 0 },
]

export default function Facturation() {
  const [factures, setFactures] = useState<Facture[]>(FACTURES_DEMO)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patient: '', soin: '', montant: '', cnas: false, casnos: false, taux_remb: 0 })

  const totalPayee = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montant, 0)
  const totalAttente = factures.filter(f => f.statut !== 'payee').reduce((s, f) => s + f.montant, 0)
  const totalRemb = factures.reduce((s, f) => s + (f.montant_remb || 0), 0)
  const facturesCnas = factures.filter(f => f.cnas || f.casnos).length

  function handleCouverture(type: string, checked: boolean) {
    const newForm = { ...form, cnas: type === 'cnas' ? checked : false, casnos: type === 'casnos' ? checked : false }
    if (!checked) newForm.taux_remb = 0
    setForm(newForm)
  }

  function handleSoinChange(soin: string) {
    const found = SOINS_CNAS.find(s => s.soin === soin)
    setForm(f => ({ ...f, soin, taux_remb: (f.cnas || f.casnos) && found ? found.taux : f.taux_remb }))
  }

  function calcRemb(): number {
    const montant = Number(form.montant) || 0
    const taux = Number(form.taux_remb) || 0
    return Math.round(montant * taux / 100)
  }

  function ajouterFacture() {
    if (!form.patient || !form.montant) return
    const montant_remb = calcRemb()
    const isoDate = new Date().toISOString().split('T')
    const newF: Facture = {
      id: 'FAC-00' + (factures.length + 1),
      patient: form.patient,
      soin: form.soin,
      montant: parseInt(form.montant),
      statut: 'en_attente',
      date: isoDate[0] ?? '2026-01-01',
      cnas: form.cnas,
      casnos: form.casnos,
      taux_remb: form.taux_remb,
      montant_remb,
    }
    setFactures([newF, ...factures])
    setForm({ patient: '', soin: '', montant: '', cnas: false, casnos: false, taux_remb: 0 })
    setShowForm(false)
  }

  function changerStatut(id: string, statut: string) {
    setFactures(factures.map(f => f.id === id ? { ...f, statut } : f))
  }

  const statutColors: Record<string, { bg: string; color: string }> = {
    payee: { bg: 'rgba(76,175,138,0.15)', color: '#4CAF8A' },
    en_attente: { bg: 'rgba(200,151,58,0.15)', color: '#E8B55A' },
    partielle: { bg: 'rgba(124,58,237,0.15)', color: '#A78BFA' },
  }

  const defaultColor = { bg: 'rgba(200,151,58,0.15)', color: '#E8B55A' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700 }}>Facturation</h1>
          <p style={{ color: '#8BBDB5', fontSize: '0.875rem', marginTop: '0.2rem' }}>Gestion des factures · CNAS · CASNOS</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.4rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
          + Nouvelle facture
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total encaissé', value: totalPayee.toLocaleString() + ' DZD', color: '#4CAF8A', icon: '✅' },
          { label: 'En attente', value: totalAttente.toLocaleString() + ' DZD', color: '#E8B55A', icon: '⏳' },
          { label: 'Remboursements', value: totalRemb.toLocaleString() + ' DZD', color: '#12A08F', icon: '🏥' },
          { label: 'CNAS/CASNOS', value: String(facturesCnas), color: '#7C3AED', icon: '📋' },
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

      {showForm && (
        <div style={{ ...card, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(18,160,143,0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.2rem' }}>Nouvelle facture</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Nom du patient *</label>
              <input style={input} value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })} placeholder="Ahmed Benali" />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Type de soin</label>
              <select style={{ ...input, background: '#132420' }} value={form.soin} onChange={e => handleSoinChange(e.target.value)}>
                <option value="">Choisir...</option>
                {SOINS_CNAS.map(s => <option key={s.soin}>{s.soin}</option>)}
                <option value="Blanchiment">Blanchiment</option>
                <option value="Implant">Implant</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Montant (DZD) *</label>
              <input style={input} type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} placeholder="5000" />
            </div>
          </div>

          <div style={{ background: 'rgba(18,160,143,0.06)', border: '1px solid rgba(18,160,143,0.15)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#12A08F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8rem' }}>🏥 Couverture sociale</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <div onClick={() => handleCouverture('cnas', !form.cnas)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid ' + (form.cnas ? '#12A08F' : 'rgba(255,255,255,0.2)'), background: form.cnas ? '#12A08F' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {form.cnas && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>CNAS</div>
                  <div style={{ fontSize: '0.68rem', color: '#8BBDB5' }}>Salarié secteur public</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <div onClick={() => handleCouverture('casnos', !form.casnos)} style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid ' + (form.casnos ? '#C8973A' : 'rgba(255,255,255,0.2)'), background: form.casnos ? '#C8973A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {form.casnos && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>CASNOS</div>
                  <div style={{ fontSize: '0.68rem', color: '#8BBDB5' }}>Travailleur indépendant</div>
                </div>
              </label>
            </div>
            {(form.cnas || form.casnos) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                    Taux remboursement: {form.taux_remb}%
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[30, 50, 80, 100].map(t => (
                      <button key={t} onClick={() => setForm({ ...form, taux_remb: t })} style={{ padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid ' + (form.taux_remb === t ? '#12A08F' : 'rgba(255,255,255,0.1)'), background: form.taux_remb === t ? 'rgba(18,160,143,0.2)' : 'transparent', color: form.taux_remb === t ? '#12A08F' : '#8BBDB5', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif" }}>
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#8BBDB5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>Montant remboursé</label>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: '#12A08F' }}>{calcRemb().toLocaleString()} DZD</div>
                  <div style={{ fontSize: '0.68rem', color: '#8BBDB5' }}>Reste: {(parseInt(form.montant || '0') - calcRemb()).toLocaleString()} DZD</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={ajouterFacture} style={{ background: 'linear-gradient(135deg,#0A7C6E,#12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>✓ Créer la facture</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', color: '#8BBDB5', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.65rem 1.5rem', fontFamily: "'DM Sans',sans-serif", fontSize: '0.875rem', cursor: 'pointer' }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ ...card, overflowX: 'auto' }}>
        <div style={{ minWidth: '700px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1.5fr 1fr 0.8fr 0.8fr 0.8fr', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.65rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(18,160,143,0.1)' }}>
            <span>N°</span><span>Patient</span><span>Soin</span><span>Montant</span><span>Couverture</span><span>Statut</span><span>Date</span>
          </div>
          {factures.map((f, i) => {
            const s = statutColors[f.statut] ?? defaultColor
            return (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1.5fr 1fr 0.8fr 0.8fr 0.8fr', gap: '0.5rem', padding: '0.8rem 1rem', borderTop: i > 0 ? '1px solid rgba(18,160,143,0.05)' : 'none', fontSize: '0.82rem', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(18,160,143,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#12A08F' }}>{f.id}</span>
                <span style={{ fontWeight: 500 }}>{f.patient}</span>
                <span style={{ color: '#8BBDB5', fontSize: '0.78rem' }}>{f.soin}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{f.montant.toLocaleString()} <span style={{ fontSize: '0.62rem', color: '#8BBDB5' }}>DZD</span></div>
                  {f.montant_remb > 0 && <div style={{ fontSize: '0.62rem', color: '#12A08F' }}>Remb: {f.montant_remb.toLocaleString()} DZD</div>}
                </div>
                <div>
                  {f.cnas && <span style={{ fontSize: '0.62rem', background: 'rgba(18,160,143,0.15)', color: '#12A08F', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block' }}>CNAS</span>}
                  {f.casnos && <span style={{ fontSize: '0.62rem', background: 'rgba(200,151,58,0.15)', color: '#C8973A', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block' }}>CASNOS</span>}
                  {!f.cnas && !f.casnos && <span style={{ fontSize: '0.62rem', color: '#8BBDB5' }}>—</span>}
                </div>
                <select value={f.statut} onChange={e => changerStatut(f.id, e.target.value)} style={{ background: s.bg, color: s.color, border: 'none', borderRadius: '100px', padding: '0.2rem 0.4rem', fontSize: '0.62rem', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
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
    </div>
  )
}
