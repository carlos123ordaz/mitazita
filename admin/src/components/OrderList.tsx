import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, authHeaders } from '../services/api';

interface Order {
  _id: string;
  code: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  customer: { name: string; surname: string; phone: string; email: string };
  mug: { modelName: string };
  total: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fff3e0', color: '#c97a30' },
  confirmed: { bg: '#e8f5e9', color: '#2a9d5a' },
  cancelled: { bg: '#fce4e4', color: '#c94444' },
};

export default function OrderList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    api.get(`/orders${params}`, authHeaders(token))
      .then((res) => setOrders(res.data))
      .catch(() => setError('Error cargando pedidos'))
      .finally(() => setLoading(false));
  }, [token, filter]);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div>
      <div style={s.pageHead}>
        <div>
          <h1 style={s.title}>Pedidos</h1>
          {pendingCount > 0 && (
            <p style={s.subtitle}>{pendingCount} pedido{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} de confirmación</p>
          )}
        </div>
      </div>

      <div style={s.filters}>
        {['', 'pending', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f === '' ? 'Todos' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && <p style={s.hint}>Cargando pedidos…</p>}
      {error && <p style={{ ...s.hint, color: 'var(--danger)' }}>{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p style={s.hint}>No hay pedidos {filter ? `con estado "${STATUS_LABELS[filter]}"` : ''}.</p>
      )}

      {!loading && orders.length > 0 && (
        <div style={s.table}>
          <div style={s.thead}>
            <span>Código</span>
            <span>Cliente</span>
            <span>Modelo</span>
            <span>Total</span>
            <span>Estado</span>
            <span>Fecha</span>
          </div>
          {orders.map((o) => (
            <div
              key={o._id}
              style={s.row}
              onClick={() => navigate(`/orders/${o._id}`)}
            >
              <span style={s.code}>{o.code}</span>
              <span>
                <div style={s.name}>{o.customer.name} {o.customer.surname}</div>
                <div style={s.phone}>{o.customer.phone}</div>
              </span>
              <span style={s.model}>{o.mug.modelName}</span>
              <span style={s.price}>S/ {o.total}</span>
              <span>
                <span style={{ ...s.badge, ...STATUS_COLORS[o.status] }}>
                  {STATUS_LABELS[o.status]}
                </span>
              </span>
              <span style={s.date}>{new Date(o.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  pageHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--ink-soft)' },
  filters: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 18px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    border: '1.5px solid var(--line)',
    background: 'var(--paper)',
    cursor: 'pointer',
    color: 'var(--ink-soft)',
    transition: 'all .2s',
  },
  filterActive: {
    background: 'var(--ink)',
    color: 'var(--bg)',
    borderColor: 'var(--ink)',
  },
  hint: { color: 'var(--ink-soft)', fontSize: 14 },
  table: {
    background: 'var(--paper)',
    borderRadius: 14,
    border: '1px solid var(--line)',
    overflow: 'hidden',
  },
  thead: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 130px 80px 110px 80px',
    padding: '12px 20px',
    background: 'var(--bg-soft)',
    fontSize: 11,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'var(--ink-soft)',
    fontWeight: 600,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 130px 80px 110px 80px',
    padding: '16px 20px',
    borderTop: '1px solid var(--line)',
    cursor: 'pointer',
    transition: 'background .15s',
    alignItems: 'center',
  },
  code: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--accent-deep)' },
  name: { fontSize: 14, fontWeight: 500 },
  phone: { fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 },
  model: { fontSize: 13, color: 'var(--ink-soft)' },
  price: { fontFamily: 'var(--font-display)', fontSize: 16 },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  date: { fontSize: 12, color: 'var(--ink-soft)' },
};
