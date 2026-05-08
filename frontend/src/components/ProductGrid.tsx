import { useState, useEffect } from 'react';
import { addToCart } from '../stores/cart';

const API_URL = (import.meta.env.PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

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

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (p: Product) => {
    addToCart({ type: 'product', productId: p._id, name: p.name, imageUrl: p.imageUrl, price: p.price });
    setAddedId(p._id);
    setTimeout(() => setAddedId(null), 1800);
    setTimeout(() => window.dispatchEvent(new CustomEvent('mitazita:openCart')), 400);
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
              <button
                className={`prod-btn${addedId === p._id ? ' prod-btn-added' : ''}`}
                onClick={() => handleAdd(p)}
              >
                {addedId === p._id ? '✓ Agregado al carrito' : 'Agregar al carrito →'}
              </button>
            </div>
          </article>
        ))}
      </div>
      <style>{css}</style>
    </>
  );
}

const css = `
  .prod-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
  }
  @media (max-width: 920px) { .prod-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
  @media (max-width: 560px) {
    .prod-grid {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 14px;
      padding-bottom: 12px;
      margin: 0 -18px;
      padding-left: 18px;
      padding-right: 18px;
      scrollbar-width: none;
    }
    .prod-grid::-webkit-scrollbar { display: none; }
    .prod-card { flex: 0 0 80%; scroll-snap-align: start; }
  }

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
    transition: color .2s, background .2s, border-color .2s;
    cursor: pointer; background: none; border-left: 0; border-right: 0; border-bottom: 0; width: 100%;
  }
  .prod-btn:hover { background: var(--ink); color: var(--bg); border-top-color: var(--ink); }
  .prod-btn-added {
    background: color-mix(in oklab, var(--accent-deep) 10%, var(--paper)) !important;
    color: var(--accent-deep) !important;
    border-top-color: color-mix(in oklab, var(--accent-deep) 30%, var(--line)) !important;
    font-weight: 600;
  }
`;
