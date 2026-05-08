import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCart, removeFromCart, clearCart, onCartChange } from '../stores/cart';
import type { CartItem, CartMugItem, CartProductItem } from '../stores/cart';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';
const WA_PHONE = '51944073494';

interface Customer {
  name: string; surname: string; phone: string;
  email: string; address: string; reference: string;
}

const blank = (): Customer => ({ name: '', surname: '', phone: '', email: '', address: '', reference: '' });

export default function CartButton() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const wantsDelivery = true;
  const [customer, setCustomer] = useState<Customer>(blank());
  const [submitting, setSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setCart(getCart());
    const unsub = onCartChange(setCart);
    const openCart = () => { setOpen(true); setShowCheckout(false); };
    window.addEventListener('mitazita:openCart', openCart);
    return () => { unsub(); window.removeEventListener('mitazita:openCart', openCart); };
  }, []);

  const deliveryFee = wantsDelivery ? 6 : 0;
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const total = subtotal + deliveryFee;
  const valid = () =>
    customer.name.trim() && customer.surname.trim() &&
    customer.phone.trim() && customer.email.trim() && customer.address.trim();
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomer(p => ({ ...p, [k]: e.target.value }));

  const closeAndReset = () => {
    setOpen(false);
    setShowCheckout(false);
    setOrderCode('');
    setCustomer(blank());
    setError('');
  };

  const submit = async () => {
    if (!valid() || cart.length === 0) return;
    setSubmitting(true);
    setError('');

    const mugs = cart.filter((i): i is CartMugItem => i.type === 'mug');
    const products = cart.filter((i): i is CartProductItem => i.type === 'product');

    let payload: object;
    if (mugs.length > 0 && products.length === 0) {
      payload = {
        orderType: 'custom', customer,
        mugs: mugs.map(m => ({ modelId: m.modelId, modelName: m.modelName, photoUrl: m.photoUrl || undefined, text: m.text, extras: m.extras })),
        basePrice: total, total,
      };
    } else if (products.length === 1 && mugs.length === 0) {
      const p = products[0];
      payload = {
        orderType: 'product', customer,
        product: { productId: p.productId, productName: p.name, imageUrl: p.imageUrl, price: p.price },
        basePrice: total, total,
      };
    } else {
      payload = {
        orderType: 'combined', customer,
        mugs: mugs.map(m => ({ modelId: m.modelId, modelName: m.modelName, photoUrl: m.photoUrl || undefined, text: m.text, extras: m.extras })),
        products: products.map(p => ({ productId: p.productId, productName: p.name, imageUrl: p.imageUrl, price: p.price })),
        basePrice: total, total,
      };
    }

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar');
      setOrderCode(data.code);
      clearCart();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button className="cart-nav-btn" onClick={() => setOpen(true)} aria-label={`Ver carrito (${cart.length})`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
      </button>

      {open && createPortal(
        <div className="cart-overlay" onClick={e => { if (e.target === e.currentTarget) closeAndReset(); }}>
          <div className="cart-drawer">
            <div className="cart-head">
              <span className="cart-head-title">Carrito{cart.length > 0 && ` (${cart.length})`}</span>
              <button className="cart-close" onClick={closeAndReset}>✕</button>
            </div>

            <div className="cart-body">
              {orderCode ? (
                <div className="cart-success">
                  <div className="cart-success-icon">✓</div>
                  <h3 className="cart-success-h">¡Pedido enviado!</h3>
                  <p className="cart-success-p">Cuando lo confirmemos recibirás un correo con los detalles.</p>
                  <div className="cart-code-box">
                    <div className="cart-code-lbl">TU CÓDIGO</div>
                    <div className="cart-code-val">{orderCode}</div>
                  </div>
                  <a
                    href={`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`Hola Mi Tazita! Hice un pedido con código *${orderCode}*. ¿Pueden confirmarlo?`)}`}
                    className="btn btn-wa"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: 20, justifyContent: 'center' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
                    </svg>
                    Coordinar por WhatsApp
                  </a>
                  <button className="cart-success-done" onClick={closeAndReset}>Cerrar</button>
                </div>
              ) : cart.length === 0 ? (
                <div className="cart-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--ink-mute)' }}>
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p className="cart-empty-title">Tu carrito está vacío</p>
                  <p className="cart-empty-hint">Agrega tazas personalizadas o diseños listos.</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setOpen(false)}>Seguir viendo →</button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        {item.type === 'product'
                          ? <img src={(item as CartProductItem).imageUrl} alt={item.name} className="cart-item-img" />
                          : (
                            <div className="cart-item-mug">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                              </svg>
                            </div>
                          )
                        }
                        <div className="cart-item-info">
                          <div className="cart-item-name">
                            {item.type === 'mug' ? (item as CartMugItem).modelName : item.name}
                          </div>
                          {item.type === 'mug' && (item as CartMugItem).text.name && (
                            <div className="cart-item-sub">Para: {(item as CartMugItem).text.name}</div>
                          )}
                          {item.type === 'mug' && !(item as CartMugItem).text.name && (
                            <div className="cart-item-sub">Taza personalizada</div>
                          )}
                          {item.type === 'product' && <div className="cart-item-sub">Diseño listo</div>}
                        </div>
                        <div className="cart-item-price">S/ {item.price}</div>
                        <button className="cart-item-del" onClick={() => removeFromCart(item.id)} title="Eliminar">✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="cart-totals">
                    <div className="cart-delivery-toggle">
                      <span className="cart-delivery-check" />
                      <div className="cart-delivery-info">
                        <span className="cart-delivery-label">Delivery Lima 24h</span>
                        <span className="cart-delivery-desc">Express puerta a puerta</span>
                      </div>
                      <span className="cart-delivery-price">S/ 6</span>
                    </div>

                    <div className="cart-totals-row">
                      <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                      <span>S/ {subtotal}</span>
                    </div>
                    {wantsDelivery && (
                      <div className="cart-totals-row">
                        <span>Delivery Lima 24h</span>
                        <span>S/ 6</span>
                      </div>
                    )}
                    <div className="cart-totals-row cart-totals-final">
                      <span>Total</span>
                      <span>S/ {total}</span>
                    </div>
                  </div>

                  {!showCheckout ? (
                    <div className="cart-foot">
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => setShowCheckout(true)}
                      >
                        Ir al checkout · S/ {total}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                      </button>
                      <button className="cart-continue" onClick={() => setOpen(false)}>Seguir comprando</button>
                    </div>
                  ) : (
                    <div className="cart-checkout">
                      <h4 className="cart-checkout-title">¿A quién se lo enviamos?</h4>
                      <div className="cart-2col">
                        <div className="cart-field"><label>Nombre *</label><input type="text" placeholder="María" value={customer.name} onChange={set('name')} /></div>
                        <div className="cart-field"><label>Apellido *</label><input type="text" placeholder="García" value={customer.surname} onChange={set('surname')} /></div>
                      </div>
                      <div className="cart-2col">
                        <div className="cart-field"><label>Teléfono *</label><input type="tel" placeholder="987 654 321" value={customer.phone} onChange={set('phone')} /></div>
                        <div className="cart-field"><label>Correo *</label><input type="email" placeholder="maria@email.com" value={customer.email} onChange={set('email')} /></div>
                      </div>
                      <div className="cart-field"><label>Dirección *</label><input type="text" placeholder="Av. La Marina 123, San Miguel" value={customer.address} onChange={set('address')} /></div>
                      <div className="cart-field"><label>Referencia (opcional)</label><input type="text" placeholder="Frente al parque…" value={customer.reference} onChange={set('reference')} /></div>
                      {error && <p className="cart-error">{error}</p>}
                      <div className="cart-checkout-foot">
                        <div className="cart-checkout-total">S/ <strong>{total}</strong></div>
                        <button
                          className="btn btn-primary"
                          onClick={submit}
                          disabled={submitting || !valid()}
                          style={{ opacity: !valid() ? 0.6 : 1 }}
                        >
                          {submitting ? 'Enviando…' : 'Confirmar pedido'}
                          {!submitting && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>}
                        </button>
                      </div>
                      <button className="cart-back-btn" onClick={() => setShowCheckout(false)}>← Volver al carrito</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{css}</style>
    </>
  );
}

const css = `
  .cart-nav-btn {
    position: relative;
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--bg-soft); border: 1.5px solid var(--line);
    color: var(--ink); cursor: pointer; transition: all .2s; flex-shrink: 0;
  }
  .cart-nav-btn:hover { background: var(--paper); border-color: var(--accent); color: var(--accent-deep); }
  .cart-count {
    position: absolute; top: -5px; right: -5px;
    background: var(--accent-deep); color: white;
    font-size: 10px; font-weight: 700;
    width: 18px; height: 18px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--paper);
  }

  .cart-overlay {
    position: fixed; inset: 0;
    background: rgba(42,31,28,.5);
    z-index: 200;
    display: flex; justify-content: flex-end;
    backdrop-filter: blur(2px);
    animation: cartFade .2s ease;
  }
  @keyframes cartFade { from { opacity: 0; } to { opacity: 1; } }

  .cart-drawer {
    width: 100%; max-width: 440px;
    background: var(--paper);
    height: 100%;
    display: flex; flex-direction: column;
    box-shadow: -4px 0 32px rgba(0,0,0,.14);
    animation: cartSlide .25s ease;
  }
  @keyframes cartSlide { from { transform: translateX(100%); } to { transform: none; } }
  @media (max-width: 480px) { .cart-drawer { max-width: 100%; } }

  .cart-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--line); flex-shrink: 0;
  }
  .cart-head-title { font-family: var(--font-display); font-size: 22px; font-weight: 500; }
  .cart-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg-soft); color: var(--ink-soft);
    font-size: 13px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 0;
  }
  .cart-close:hover { background: var(--line); }

  .cart-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

  .cart-items { padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; }

  .cart-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 12px;
    border: 1.5px solid var(--line);
  }
  .cart-item-img {
    width: 52px; height: 52px; border-radius: 8px;
    object-fit: cover; flex-shrink: 0; border: 1px solid var(--line);
  }
  .cart-item-mug {
    width: 52px; height: 52px; border-radius: 8px;
    background: var(--bg-soft); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--ink-soft);
  }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-name {
    font-family: var(--font-display); font-size: 16px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cart-item-sub { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
  .cart-item-price { font-family: var(--font-display); font-size: 16px; color: var(--accent-deep); flex-shrink: 0; }
  .cart-item-del {
    color: var(--ink-mute); font-size: 12px; padding: 4px 6px;
    border: 0; background: none; cursor: pointer; flex-shrink: 0;
    border-radius: 4px; transition: all .15s;
  }
  .cart-item-del:hover { color: #c94444; background: #fdf2f2; }

  .cart-totals {
    padding: 12px 24px; border-top: 1px solid var(--line);
    display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
  }
  .cart-delivery-toggle {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 10px;
    border: 1.5px solid var(--accent-deep);
    background: color-mix(in oklab, var(--accent) 6%, var(--paper));
    margin-bottom: 6px;
  }
  .cart-delivery-check {
    width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
    background: var(--accent-deep); border: 1.5px solid var(--accent-deep);
    display: flex; align-items: center; justify-content: center;
  }
  .cart-delivery-check::after {
    content: "✓"; color: white; font-size: 11px; font-weight: 700;
  }
  .cart-delivery-info { flex: 1; }
  .cart-delivery-label { font-size: 13px; font-weight: 500; display: block; }
  .cart-delivery-desc { font-size: 11px; color: var(--ink-soft); }
  .cart-delivery-price { font-family: var(--font-display); font-size: 15px; flex-shrink: 0; }

  .cart-totals-row {
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 13px; color: var(--ink-soft);
  }
  .cart-totals-final {
    font-family: var(--font-display); font-size: 20px;
    color: var(--ink); padding-top: 8px;
    border-top: 1px solid color-mix(in oklab, var(--line) 70%, transparent);
    margin-top: 4px;
  }
  .cart-totals-final span:last-child { color: var(--accent-deep); font-size: 26px; }

  .cart-foot {
    padding: 16px 24px 20px; display: flex; flex-direction: column; gap: 10px;
    border-top: 1px solid var(--line); flex-shrink: 0;
  }
  .cart-continue {
    font-size: 13px; color: var(--ink-soft); text-align: center;
    padding: 6px; cursor: pointer; border: 0; background: none;
  }
  .cart-continue:hover { color: var(--ink); }

  .cart-checkout { padding: 16px 24px 24px; flex-shrink: 0; }
  .cart-checkout-title { font-family: var(--font-display); font-size: 20px; margin-bottom: 14px; }
  .cart-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 480px) { .cart-2col { grid-template-columns: 1fr; } }
  .cart-field { margin-top: 10px; }
  .cart-field label { font-size: 11px; letter-spacing: .04em; color: var(--ink-soft); display: block; margin-bottom: 4px; font-weight: 500; }
  .cart-field input {
    width: 100%; padding: 10px 12px; border-radius: 9px;
    border: 1.5px solid var(--line); background: var(--paper);
    font-family: var(--font-body); font-size: 14px; color: var(--ink);
    transition: border-color .2s;
  }
  .cart-field input:focus { outline: none; border-color: var(--accent-deep); }
  .cart-error { font-size: 12px; color: #c94444; margin-top: 10px; padding: 10px 12px; background: #fdf2f2; border-radius: 8px; }
  .cart-checkout-foot {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 16px; gap: 12px; flex-wrap: wrap;
  }
  .cart-checkout-total { font-family: var(--font-display); font-size: 18px; }
  .cart-checkout-total strong { color: var(--accent-deep); font-size: 24px; }
  .cart-back-btn {
    color: var(--ink-soft); font-size: 13px; padding: 8px 0; margin-top: 10px;
    cursor: pointer; border: 0; background: none; display: block;
  }
  .cart-back-btn:hover { color: var(--ink); }

  .cart-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px 24px; text-align: center; gap: 6px;
  }
  .cart-empty-title { font-family: var(--font-display); font-size: 22px; margin-top: 16px; }
  .cart-empty-hint { font-size: 13px; color: var(--ink-soft); max-width: 260px; line-height: 1.5; }

  .cart-success {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px 24px; text-align: center;
  }
  .cart-success-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--accent-deep); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 700; margin-bottom: 20px;
  }
  .cart-success-h { font-family: var(--font-display); font-size: 28px; margin-bottom: 8px; }
  .cart-success-p { color: var(--ink-soft); font-size: 14px; max-width: 300px; line-height: 1.6; margin-bottom: 20px; }
  .cart-code-box { background: var(--bg-soft); border-radius: 12px; padding: 18px 28px; margin-bottom: 16px; }
  .cart-code-lbl { font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 6px; }
  .cart-code-val { font-size: 32px; font-weight: 700; letter-spacing: .1em; font-family: 'Courier New', monospace; color: var(--accent-deep); }
  .cart-success-done {
    font-size: 13px; color: var(--ink-soft); margin-top: 20px;
    cursor: pointer; border: 0; background: none; text-decoration: underline;
  }
  .cart-success-done:hover { color: var(--ink); }
`;
