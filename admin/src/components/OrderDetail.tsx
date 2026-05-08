import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, authHeaders } from '../services/api';

interface Order {
  _id: string;
  code: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  customer: {
    name: string;
    surname: string;
    phone: string;
    email: string;
    address: string;
    reference: string;
  };
  mug: {
    modelId: string;
    modelName: string;
    photoUrl?: string;
    text: { name: string; dedication: string };
    extras: { caja: boolean; tarjeta: boolean; magica: boolean; delivery: boolean };
  };
  basePrice: number;
  total: number;
  createdAt: string;
  confirmedAt?: string;
}

const EXTRAS_LABELS: Record<string, string> = {
  caja: 'Caja de regalo (+S/ 8)',
  tarjeta: 'Tarjeta dedicatoria (+S/ 5)',
  delivery: 'Delivery Lima 24h (+S/ 6)',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const buildWaUrl = (o: Order) => {
    const phone = o.customer.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `¡Hola ${o.customer.name}! 🎉\n\nTu pedido *${o.code}* de Mi Tazita ha sido confirmado.\n\nPronto te contactaremos para coordinar el pago y la entrega de tu taza personalizada.\n\n¡Gracias por confiar en nosotros! ☕`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  useEffect(() => {
    if (!token || !id) return;
    api.get(`/orders/${id}`, authHeaders(token))
      .then((res) => {
        const o: Order = res.data;
        setOrder(o);
        if (o.status === 'confirmed') setWhatsappUrl(buildWaUrl(o));
      })
      .catch(() => setError('Pedido no encontrado'))
      .finally(() => setLoading(false));
  }, [token, id]);

  const confirm = async () => {
    if (!token || !order) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/orders/${order._id}/confirm`, {}, authHeaders(token));
      setOrder(res.data.order);
      setWhatsappUrl(res.data.whatsappUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error confirmando pedido';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const cancel = async () => {
    if (!token || !order) return;
    if (!confirm_native('¿Cancelar este pedido?')) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/orders/${order._id}/cancel`, {}, authHeaders(token));
      setOrder(res.data.order);
    } catch {
      setError('Error cancelando pedido');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--ink-soft)' }}>Cargando…</p>;
  if (error && !order) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!order) return null;

  const activeExtras = Object.entries(order.mug.extras)
    .filter(([, val]) => val)
    .map(([key]) => EXTRAS_LABELS[key]);

  const statusColor: Record<string, string> = {
    pending: '#c97a30',
    confirmed: '#2a9d5a',
    cancelled: '#c94444',
  };

  return (
    <div>
      <button style={s.back} onClick={() => navigate('/')}>
        ← Volver a pedidos
      </button>

      <div style={s.header}>
        <div>
          <div style={s.code}>{order.code}</div>
          <div style={{ ...s.badge, color: statusColor[order.status] }}>
            {{ pending: 'Pendiente', confirmed: 'Confirmado', cancelled: 'Cancelado' }[order.status]}
          </div>
        </div>
        {order.status === 'pending' && (
          <div style={s.actions}>
            <button onClick={confirm} disabled={actionLoading} style={s.btnConfirm}>
              {actionLoading ? 'Procesando…' : '✓ Confirmar pedido'}
            </button>
            <button onClick={cancel} disabled={actionLoading} style={s.btnCancel}>
              Cancelar
            </button>
          </div>
        )}
        {order.status === 'confirmed' && whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={s.btnWa}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
            Enviar WhatsApp al cliente
          </a>
        )}
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: 16, fontSize: 13 }}>{error}</p>}

      <div style={s.grid}>
        {/* Customer */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Cliente</h3>
          <Row label="Nombre" value={`${order.customer.name} ${order.customer.surname}`} />
          <Row label="Teléfono" value={order.customer.phone} />
          <Row label="Email" value={order.customer.email} />
          <Row label="Dirección" value={order.customer.address} />
          {order.customer.reference && <Row label="Referencia" value={order.customer.reference} />}
          <div style={s.waLink}>
            <a
              href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={s.waText}
            >
              Abrir WhatsApp del cliente →
            </a>
          </div>
        </div>

        {/* Mug */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Taza</h3>
          <Row label="Modelo" value={order.mug.modelName} />
          {order.mug.text.name && <Row label="Nombre en taza" value={order.mug.text.name} />}
          {order.mug.text.dedication && <Row label="Dedicatoria" value={`"${order.mug.text.dedication}"`} />}
          {activeExtras.length > 0 && (
            <div style={s.extrasBlock}>
              <div style={s.rowLabel}>Extras</div>
              <ul style={s.extrasList}>
                {activeExtras.map((e) => <li key={e} style={s.extrasItem}>✓ {e}</li>)}
              </ul>
            </div>
          )}
          {order.mug.photoUrl && (
            <div style={s.photoBlock}>
              <div style={s.rowLabel}>Foto</div>
              <img src={order.mug.photoUrl} alt="Foto del pedido" style={s.photo} />
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Resumen</h3>
          <Row label="Precio base" value={`S/ ${order.basePrice}`} />
          <Row label="Total" value={`S/ ${order.total}`} bold />
          <Row label="Pedido realizado" value={new Date(order.createdAt).toLocaleString('es-PE')} />
          {order.confirmedAt && (
            <Row label="Confirmado" value={new Date(order.confirmedAt).toLocaleString('es-PE')} />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={s.rowWrap}>
      <span style={s.rowLabel}>{label}</span>
      <span style={{ ...s.rowValue, fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function confirm_native(msg: string): boolean {
  return window.confirm(msg);
}

const s: Record<string, React.CSSProperties> = {
  back: {
    fontSize: 13,
    color: 'var(--ink-soft)',
    padding: '0 0 24px',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--accent-deep)',
    letterSpacing: '.06em',
  },
  badge: { fontSize: 13, fontWeight: 600, marginTop: 4 },
  actions: { display: 'flex', gap: 12, alignItems: 'center' },
  btnConfirm: {
    padding: '12px 24px',
    borderRadius: 999,
    background: 'var(--success)',
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '11px 20px',
    borderRadius: 999,
    border: '1.5px solid var(--danger)',
    color: 'var(--danger)',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
  },
  btnWa: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: 999,
    background: '#25D366',
    color: 'white',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  card: {
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 14,
    padding: '24px',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: '1px solid var(--line)',
  },
  rowWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 0',
    borderBottom: '1px solid var(--line)',
    fontSize: 14,
  },
  rowLabel: { color: 'var(--ink-soft)', flexShrink: 0 },
  rowValue: { textAlign: 'right', wordBreak: 'break-word' },
  extrasBlock: { padding: '8px 0', borderBottom: '1px solid var(--line)' },
  extrasList: { margin: '6px 0 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 },
  extrasItem: { fontSize: 13, color: 'var(--ink)' },
  photoBlock: { padding: '12px 0' },
  photo: { width: '100%', borderRadius: 10, marginTop: 8, objectFit: 'cover', maxHeight: 240 },
  waLink: { marginTop: 16 },
  waText: { fontSize: 13, color: 'var(--accent-deep)', textDecoration: 'underline', cursor: 'pointer' },
};
