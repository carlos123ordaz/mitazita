import { useState, useEffect } from 'react';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface CustomerData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  address: string;
  reference: string;
}

interface OrderResult {
  code: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<CustomerData>({ name: '', surname: '', phone: '', email: '', address: '', reference: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const closeModal = () => { setSelected(null); setResult(null); setError(''); setCustomer({ name: '', surname: '', phone: '', email: '', address: '', reference: '' }); };

  const customerValid = () => customer.name.trim() && customer.surname.trim() && customer.phone.trim() && customer.email.trim() && customer.address.trim();

  const handleChange = (field: keyof CustomerData, value: string) =>
    setCustomer((p) => ({ ...p, [field]: value }));

  const submitOrder = async () => {
    if (!selected || !customerValid()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'product',
          customer,
          product: { productId: selected._id, productName: selected.name, imageUrl: selected.imageUrl, price: selected.price },
          basePrice: selected.price,
          total: selected.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setResult({ code: data.code });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--ink-soft)', fontSize: 14, padding: '20px 0' }}>Cargando diseños…</div>;
  if (products.length === 0) return null;

  return (
    <>
      <div className="prod-grid">
        {products.map((p) => (
          <article key={p._id} className="prod-card">
            <div className="prod-img-wrap">
              <img src={p.imageUrl} alt={p.name} className="prod-img" loading="lazy" />
              <span className="prod-cat">{p.category}</span>
            </div>
            <div className="prod-body">
              <div className="prod-top">
                <span className="prod-name">{p.name}</span>
                <span className="prod-price">
                  {p.oldPrice && <s>S/ {p.oldPrice}</s>}S/ {p.price}
                </span>
              </div>
              <p className="prod-desc">{p.description}</p>
              <button className="prod-btn" onClick={() => setSelected(p)}>
                Pedir ahora →
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="prod-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="prod-modal">
            <button className="prod-modal-close" onClick={closeModal}>✕</button>

            {result ? (
              <div className="prod-success">
                <div className="prod-success-icon">✓</div>
                <h3 className="prod-success-title">¡Pedido enviado!</h3>
                <p className="prod-success-sub">Cuando lo confirmemos te llegará un correo con los detalles.</p>
                <div className="prod-code-box">
                  <div className="prod-code-label">TU CÓDIGO</div>
                  <div className="prod-code-value">{result.code}</div>
                </div>
                <a
                  href={`https://wa.me/51944073494?text=${encodeURIComponent(`Hola Mi Tazita! Pedí *${selected.name}* con código *${result.code}*. ¿Pueden confirmarlo?`)}`}
                  className="btn btn-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: 24 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
                  Coordinar por WhatsApp
                </a>
              </div>
            ) : (
              <>
                <div className="prod-modal-preview">
                  <img src={selected.imageUrl} alt={selected.name} className="prod-modal-img" />
                  <div>
                    <div className="prod-modal-name">{selected.name}</div>
                    <div className="prod-modal-price">S/ {selected.price}</div>
                    <div className="prod-modal-desc">{selected.description}</div>
                  </div>
                </div>

                <div className="prod-divider"></div>

                <h4 className="prod-form-title">¿A quién se lo enviamos?</h4>
                <div className="prod-form-2col">
                  <div className="cz-field"><label>Nombre *</label><input type="text" placeholder="María" value={customer.name} onChange={(e) => handleChange('name', e.target.value)} /></div>
                  <div className="cz-field"><label>Apellido *</label><input type="text" placeholder="García" value={customer.surname} onChange={(e) => handleChange('surname', e.target.value)} /></div>
                </div>
                <div className="prod-form-2col">
                  <div className="cz-field"><label>Teléfono *</label><input type="tel" placeholder="987 654 321" value={customer.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
                  <div className="cz-field"><label>Correo *</label><input type="email" placeholder="maria@email.com" value={customer.email} onChange={(e) => handleChange('email', e.target.value)} /></div>
                </div>
                <div className="cz-field"><label>Dirección *</label><input type="text" placeholder="Av. La Marina 123, San Miguel" value={customer.address} onChange={(e) => handleChange('address', e.target.value)} /></div>
                <div className="cz-field"><label>Referencia (opcional)</label><input type="text" placeholder="Frente al parque…" value={customer.reference} onChange={(e) => handleChange('reference', e.target.value)} /></div>

                {error && <p className="cz-error">{error}</p>}

                <div className="prod-modal-foot">
                  <div className="prod-modal-total">Total: <strong>S/ {selected.price}</strong></div>
                  <button
                    className="btn btn-primary"
                    onClick={submitOrder}
                    disabled={submitting || !customerValid()}
                    style={{ opacity: !customerValid() ? 0.6 : 1 }}
                  >
                    {submitting ? 'Enviando…' : 'Confirmar pedido'}
                    {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{css}</style>
    </>
  );
}

const css = `
  .prod-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
  }
  @media (max-width: 920px) { .prod-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
  @media (max-width: 560px) { .prod-grid { grid-template-columns: 1fr; } }

  .prod-card {
    background: var(--paper); border-radius: 14px; overflow: hidden;
    border: 1px solid var(--line);
    transition: transform .3s ease, box-shadow .3s ease, border-color .3s;
    display: flex; flex-direction: column;
  }
  .prod-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lift); border-color: color-mix(in oklab, var(--accent) 40%, var(--line)); }

  .prod-img-wrap { aspect-ratio: 1/1; position: relative; overflow: hidden; background: var(--bg-soft); }
  .prod-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
  .prod-card:hover .prod-img { transform: scale(1.04); }
  .prod-cat {
    position: absolute; top: 14px; left: 14px;
    background: var(--paper); padding: 5px 11px; border-radius: 999px;
    font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--ink-soft); font-weight: 500;
  }

  .prod-body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 4px; }
  .prod-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .prod-name { font-family: var(--font-display); font-size: 22px; font-weight: 500; }
  .prod-price { font-family: var(--font-display); font-size: 20px; }
  .prod-price s { color: var(--ink-mute); margin-right: 6px; font-size: 14px; }
  .prod-desc { color: var(--ink-soft); font-size: 13px; margin: 4px 0 14px; }
  .prod-btn {
    margin-top: auto; padding: 12px 0; text-align: center;
    border-top: 1px solid var(--line); color: var(--ink); font-size: 13px;
    font-weight: 500; letter-spacing: .02em;
    transition: color .2s, background .2s; cursor: pointer; background: none; border-left: 0; border-right: 0; border-bottom: 0; width: 100%;
  }
  .prod-btn:hover { background: var(--ink); color: var(--bg); border-top-color: var(--ink); }

  .prod-overlay {
    position: fixed; inset: 0; background: rgba(42,31,28,.55);
    z-index: 100; display: flex; align-items: center; justify-content: center;
    padding: 20px; backdrop-filter: blur(4px);
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .prod-modal {
    background: var(--paper); border-radius: 20px; border: 1px solid var(--line);
    box-shadow: var(--shadow-lift); width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    padding: 32px; position: relative;
    animation: slideUp .25s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }

  .prod-modal-close {
    position: absolute; top: 18px; right: 18px;
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg-soft); color: var(--ink-soft);
    font-size: 13px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 0;
  }
  .prod-modal-close:hover { background: var(--line); }

  .prod-modal-preview { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 0; }
  .prod-modal-img { width: 90px; height: 90px; border-radius: 10px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--line); }
  .prod-modal-name { font-family: var(--font-display); font-size: 22px; margin-bottom: 4px; }
  .prod-modal-price { font-family: var(--font-display); font-size: 20px; color: var(--accent-deep); }
  .prod-modal-desc { font-size: 13px; color: var(--ink-soft); margin-top: 6px; }

  .prod-divider { border: 0; border-top: 1px solid var(--line); margin: 20px 0; }
  .prod-form-title { font-family: var(--font-display); font-size: 22px; margin-bottom: 16px; }
  .prod-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 480px) { .prod-form-2col { grid-template-columns: 1fr; } }

  .prod-modal-foot {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--line); gap: 12px;
    flex-wrap: wrap;
  }
  .prod-modal-total { font-family: var(--font-display); font-size: 20px; }
  .prod-modal-total strong { color: var(--accent-deep); }

  .prod-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 16px 0 8px; }
  .prod-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--accent-deep); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
  .prod-success-title { font-family: var(--font-display); font-size: 30px; margin-bottom: 8px; }
  .prod-success-sub { color: var(--ink-soft); font-size: 14px; max-width: 340px; line-height: 1.6; margin-bottom: 20px; }
  .prod-code-box { background: var(--bg-soft); border-radius: 12px; padding: 18px 28px; }
  .prod-code-label { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 6px; }
  .prod-code-value { font-size: 34px; font-weight: 700; letter-spacing: .1em; font-family: 'Courier New', monospace; color: var(--accent-deep); }
`;
