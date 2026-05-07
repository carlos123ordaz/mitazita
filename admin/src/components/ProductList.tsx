import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, authHeaders } from '../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
  createdAt: string;
}

export default function ProductList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    setLoading(true);
    api.get('/products/all', authHeaders(token))
      .then((r) => setProducts(r.data))
      .catch(() => setError('Error cargando productos'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const toggle = async (id: string) => {
    if (!token) return;
    setToggling(id);
    try {
      const r = await api.patch(`/products/${id}/toggle`, {}, authHeaders(token));
      setProducts((prev) => prev.map((p) => p._id === id ? r.data : p));
    } catch {
      setError('Error al cambiar estado');
    } finally {
      setToggling(null);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/products/${id}`, authHeaders(token));
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError('Error al eliminar producto');
    }
  };

  return (
    <div>
      <div style={s.head}>
        <div>
          <h1 style={s.title}>Diseños listos</h1>
          <p style={s.sub}>Productos prediseñados disponibles en el sitio</p>
        </div>
        <button style={s.btnNew} onClick={() => navigate('/products/new')}>
          + Nuevo producto
        </button>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Cargando…</p>}

      {!loading && products.length === 0 && (
        <div style={s.empty}>
          <p>No hay productos todavía.</p>
          <button style={s.btnNew} onClick={() => navigate('/products/new')}>Crear el primero</button>
        </div>
      )}

      <div style={s.grid}>
        {products.map((p) => (
          <div key={p._id} style={{ ...s.card, opacity: p.active ? 1 : 0.55 }}>
            <div style={s.imgWrap}>
              <img src={p.imageUrl} alt={p.name} style={s.img} />
              <span style={{ ...s.badge, ...(p.active ? s.badgeActive : s.badgeOff) }}>
                {p.active ? 'Activo' : 'Oculto'}
              </span>
            </div>
            <div style={s.cardBody}>
              <div style={s.cardTop}>
                <span style={s.name}>{p.name}</span>
                <span style={s.price}>S/ {p.price}</span>
              </div>
              <p style={s.cat}>{p.category}</p>
              <p style={s.desc}>{p.description}</p>
              <div style={s.actions}>
                <button style={s.btnEdit} onClick={() => navigate(`/products/${p._id}/edit`)}>
                  Editar
                </button>
                <button
                  style={s.btnToggle}
                  onClick={() => toggle(p._id)}
                  disabled={toggling === p._id}
                >
                  {toggling === p._id ? '…' : p.active ? 'Ocultar' : 'Publicar'}
                </button>
                <button style={s.btnDel} onClick={() => remove(p._id, p.name)}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--ink-soft)' },
  btnNew: {
    padding: '11px 22px', borderRadius: 999,
    background: 'var(--ink)', color: 'var(--bg)',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  empty: { textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 },
  card: { background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', transition: 'opacity .2s' },
  imgWrap: { position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: 'var(--bg-soft)' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  badge: {
    position: 'absolute', top: 10, left: 10,
    padding: '4px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
  },
  badgeActive: { background: '#e8f5e9', color: '#2a9d5a' },
  badgeOff: { background: '#f5f0eb', color: '#9b8a82' },
  cardBody: { padding: '16px 18px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
  name: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 },
  price: { fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--accent-deep)' },
  cat: { fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 },
  desc: { fontSize: 13, color: 'var(--ink-soft)', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties,
  actions: { display: 'flex', gap: 8 },
  btnEdit: { padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 12, fontWeight: 500, cursor: 'pointer', flex: 1 },
  btnToggle: { padding: '7px 14px', borderRadius: 8, border: '1.5px solid var(--line)', fontSize: 12, fontWeight: 500, cursor: 'pointer', flex: 1 },
  btnDel: { padding: '7px 14px', borderRadius: 8, border: '1.5px solid #f5c5c5', color: 'var(--danger)', fontSize: 12, fontWeight: 500, cursor: 'pointer' },
};
