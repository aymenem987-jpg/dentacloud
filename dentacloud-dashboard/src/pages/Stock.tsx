import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../lib/supabaseClient'

// ═══════════════════════════════════════════════════════════════════════════
// Supabase client imported from src/lib/supabaseClient.js
// Do NOT call createClient() in any other file.
// ═══════════════════════════════════════════════════════════════════════════

interface Article {
  id: string
  nom: string
  categorie: string
  quantite: number
  quantite_min: number
  unite: string
  prix_unitaire: number | null
  fournisseur: string | null
  user_id: string
  created_at?: string
  updated_at?: string
}

interface FormState {
  nom: string
  categorie: string
  quantite: number
  quantite_min: number
  unite: string
  prix_unitaire: string
  fournisseur: string
}

const card: CSSProperties = {
  background: 'rgba(19,36,32,0.8)',
  border: '1px solid rgba(18,160,143,0.15)',
  borderRadius: '12px',
  padding: '1.2rem',
}

const inputStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '0.7rem 0.9rem',
  color: '#F0F9F7',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const categories = ['Consommables', 'Instruments', 'Médicaments', 'Matériaux', 'Protection', 'Autres']

const articlesDefaut: Omit<Article, 'id' | 'user_id'>[] = [
  { nom: 'Gants latex (boîte)', categorie: 'Protection', quantite: 10, quantite_min: 3, unite: 'boîte', prix_unitaire: 450, fournisseur: null },
  { nom: 'Masques chirurgicaux (boîte)', categorie: 'Protection', quantite: 8, quantite_min: 3, unite: 'boîte', prix_unitaire: 350, fournisseur: null },
  { nom: 'Anesthésique lidocaïne', categorie: 'Médicaments', quantite: 5, quantite_min: 10, unite: 'boîte', prix_unitaire: 1200, fournisseur: null },
  { nom: 'Composite dentaire', categorie: 'Matériaux', quantite: 4, quantite_min: 5, unite: 'seringue', prix_unitaire: 2500, fournisseur: null },
  { nom: 'Fraises dentaires', categorie: 'Instruments', quantite: 20, quantite_min: 10, unite: 'unité', prix_unitaire: 800, fournisseur: null },
]

const initialForm: FormState = {
  nom: '', categorie: 'Consommables', quantite: 0,
  quantite_min: 5, unite: 'unité', prix_unitaire: '', fournisseur: ''
}

export default function Stock() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Article | null>(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [form, setForm] = useState<FormState>(initialForm)

  async function fetchStock(uid: string) {
    try {
      const { data, error } = await supabase.from('stock').select('*').eq('user_id', uid).order('nom')
      if (error) console.error('Error fetching stock:', error)
      setArticles((data as Article[]) || [])
    } catch (err) {
      console.error('Unexpected error fetching stock:', err)
      setArticles([])
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        fetchStock(user.id)
      }
    })
  }, [])

  async function handleSave() {
    if (!form.nom || !userId) return
    try {
      const payload = {
        ...form,
        prix_unitaire: form.prix_unitaire ? parseFloat(form.prix_unitaire) : null,
        fournisseur: form.fournisseur || null,
      }
      if (editItem) {
        const { error } = await supabase
          .from('stock')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editItem.id)
        if (error) { console.error('Error updating stock item:', error); alert('Erreur lors de la modification.'); return }
      } else {
        const { error } = await supabase.from('stock').insert([{ ...payload, user_id: userId }])
        if (error) { console.error('Error adding stock item:', error); alert("Erreur lors de l'ajout."); return }
      }
      setShowForm(false)
      setEditItem(null)
      resetForm()
      await fetchStock(userId)
    } catch (err) {
      console.error('Unexpected error saving stock item:', err)
      alert('Erreur de connexion.')
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Supprimer cet article ?') || !userId) return
    try {
      const { error } = await supabase.from('stock').delete().eq('id', id)
      if (error) { console.error('Error deleting stock item:', error); alert('Erreur lors de la suppression.'); return }
      await fetchStock(userId)
    } catch (err) {
      console.error('Unexpected error deleting stock item:', err)
    }
  }

  async function handleQuantite(id: string, delta: number) {
    if (!userId) return
    const item = articles.find(a => a.id === id)
    if (!item) return
    const newQty = Math.max(0, item.quantite + delta)
    try {
      const { error } = await supabase.from('stock').update({ quantite: newQty }).eq('id', id)
      if (error) { console.error('Error updating quantity:', error); alert('Erreur lors de la mise à jour de la quantité.'); return }
      await fetchStock(userId)
    } catch (err) {
      console.error('Unexpected error updating quantity:', err)
    }
  }

  async function loadArticlesDefaut() {
    if (!userId) return
    const inserts = articlesDefaut.map(a => ({ ...a, user_id: userId }))
    try {
      await supabase.from('stock').insert(inserts)
      await fetchStock(userId)
    } catch (err) {
      console.error('Unexpected error loading default articles:', err)
    }
  }

  function resetForm() {
    setForm(initialForm)
  }

  function openEdit(item: Article) {
    setEditItem(item)
    setForm({
      nom: item.nom,
      categorie: item.categorie || 'Consommables',
      quantite: item.quantite,
      quantite_min: item.quantite_min,
      unite: item.unite,
      prix_unitaire: item.prix_unitaire != null ? String(item.prix_unitaire) : '',
      fournisseur: item.fournisseur || ''
    })
    setShowForm(true)
  }

  const filtered = articles.filter(a => {
    const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat ? a.categorie === filterCat : true
    return matchSearch && matchCat
  })

  const alertes = articles.filter(a => a.quantite <= a.quantite_min)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            💊 Gestion du Stock
          </h1>
          <p style={{ color: '#8BBDB5', fontSize: '0.875rem' }}>Suivez vos consommables et recevez des alertes de rupture</p>
        </div>
        <button onClick={() => { setEditItem(null); resetForm(); setShowForm(true) }} style={{ background: 'linear-gradient(135deg, #0A7C6E, #12A08F)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem' }}>
          + Ajouter un article
        </button>
      </div>

      {/* Alertes stock faible */}
      {alertes.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(229,115,115,0.1), rgba(229,115,115,0.05))', border: '1px solid rgba(229,115,115,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: '#E57373', marginBottom: '0.5rem' }}>⚠️ {alertes.length} article{alertes.length > 1 ? 's' : ''} en stock critique</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {alertes.map(a => (
              <span key={a.id} style={{ background: 'rgba(229,115,115,0.15)', color: '#E57373', fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>
                {a.nom} ({a.quantite} {a.unite})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Articles', value: articles.length, icon: '📦', color: '#12A08F' },
          { label: 'Stock Critique', value: alertes.length, icon: '⚠️', color: '#E57373' },
          { label: 'Valeur Stock', value: articles.reduce((s, a) => s + (a.quantite * (a.prix_unitaire || 0)), 0).toLocaleString('fr-DZ') + ' DZD', icon: '💰', color: '#C8973A' },
          { label: 'Catégories', value: [...new Set(articles.map(a => a.categorie))].length, icon: '🏷️', color: '#7C3AED' },
        ].map((k, i) => (
          <div key={i} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</span>
              <span style={{ fontSize: '1.2rem' }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          style={{ ...inputStyle, maxWidth: '280px' }}
          placeholder="🔍 Rechercher un article..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={{ ...inputStyle, maxWidth: '200px', background: '#132420' }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table articles */}
      <div style={{ ...card, padding: 0 }}>
        <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(18,160,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Articles ({filtered.length})
          </span>
          {articles.length === 0 && (
            <button onClick={loadArticlesDefaut} style={{ background: 'rgba(18,160,143,0.1)', color: '#12A08F', border: '1px solid rgba(18,160,143,0.3)', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif" }}>
              Charger articles types →
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8BBDB5' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
            <div>Aucun article trouvé</div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Cliquez sur "+ Ajouter un article" pour commencer</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '700px' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', gap: '0.5rem', padding: '0.5rem 1.2rem', fontSize: '0.65rem', color: '#8BBDB5', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(18,160,143,0.08)' }}>
                <span>Article</span><span>Catégorie</span><span>Quantité</span><span>Prix unit.</span><span>Actions</span>
              </div>
              {filtered.map(a => {
                const critique = a.quantite <= a.quantite_min
                return (
                  <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 1.2rem', borderTop: '1px solid rgba(18,160,143,0.05)', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(18,160,143,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{a.nom}</div>
                      {a.fournisseur && <div style={{ fontSize: '0.68rem', color: '#8BBDB5' }}>{a.fournisseur}</div>}
                    </div>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(18,160,143,0.1)', color: '#12A08F', padding: '0.2rem 0.5rem', borderRadius: '100px', width: 'fit-content' }}>{a.categorie}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => handleQuantite(a.id, -1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#F0F9F7', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>−</button>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: critique ? '#E57373' : '#F0F9F7', minWidth: '30px', textAlign: 'center' }}>
                        {a.quantite} <span style={{ fontSize: '0.65rem', color: '#8BBDB5' }}>{a.unite}</span>
                      </span>
                      <button onClick={() => handleQuantite(a.id, 1)} style={{ background: 'rgba(18,160,143,0.15)', border: 'none', color: '#12A08F', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>+</button>
                      {critique && <span style={{ fontSize: '0.6rem', color: '#E57373' }}>⚠️</span>}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#8BBDB5' }}>
                      {a.prix_unitaire ? `${Number(a.prix_unitaire).toLocaleString()} DZD` : '—'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(a)} style={{ background: 'rgba(18,160,143,0.1)', border: 'none', color: '#12A08F', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem' }}>✏️</button>
                      <button onClick={() => handleDelete(a.id)} style={{ background: 'rgba(229,115,115,0.1)', border: 'none', color: '#E57373', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem' }}>🗑️</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal ajout/edit */}
      {showForm && (
        <div onClick={e => e.target === e.currentTarget && setShowForm(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'rgba(13,31,28,0.98)', border: '1px solid rgba(18,160,143,0.2)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#8BBDB5', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              {editItem ? '✏️ Modifier article' : '+ Nouvel article'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Nom de l'article *</label>
                <input
                  style={inputStyle}
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Gants latex"
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#12A08F'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Catégorie</label>
                <select style={{ ...inputStyle, background: '#132420' }} value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Unité</label>
                <input
                  style={inputStyle}
                  value={form.unite}
                  onChange={e => setForm({ ...form, unite: e.target.value })}
                  placeholder="boîte, unité, seringue..."
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#12A08F'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Quantité actuelle</label>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  value={form.quantite}
                  onChange={e => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#12A08F'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Alerte stock min</label>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  value={form.quantite_min}
                  onChange={e => setForm({ ...form, quantite_min: parseInt(e.target.value) || 0 })}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#12A08F'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Prix unitaire (DZD)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min={0}
                  value={form.prix_unitaire}
                  onChange={e => setForm({ ...form, prix_unitaire: e.target.value })}
                  placeholder="0"
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#12A08F'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '0.72rem', color: '#8BBDB5', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Fournisseur</label>
                <input
                  style={inputStyle}
                  value={form.fournisseur}
                  onChange={e => setForm({ ...form, fournisseur: e.target.value })}
                  placeholder="Nom du fournisseur"
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#12A08F'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#8BBDB5', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Annuler</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '0.8rem', background: 'linear-gradient(135deg, #0A7C6E, #12A08F)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                {editItem ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}