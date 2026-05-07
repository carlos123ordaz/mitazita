import { MUG_MODELS } from '../data';
import Mug from './Mug';

export default function Gallery() {
  const goToCustomizer = (modelId: string) => {
    window.dispatchEvent(new CustomEvent('mitazita:setModel', { detail: modelId }));
    setTimeout(() => {
      document.getElementById('personalizar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <>
      {MUG_MODELS.map((m) => (
        <article key={m.id} className="mug-card">
          <div className="mug-photo" style={{ background: m.accent }}>
            {m.tag && (
              <span className={`mug-tag${m.isNew ? ' new' : ''}`}>{m.tag}</span>
            )}
            {m.imageUrl ? (
              <img
                src={m.imageUrl}
                alt={m.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 }}>
                <Mug model={m} size={240} showPhoto={true} />
              </div>
            )}
          </div>
          <div className="mug-info">
            <div className="mug-info-top">
              <span className="mug-name">{m.name}</span>
              <span className="mug-price">
                {m.oldPrice && <s>S/ {m.oldPrice}</s>}S/ {m.price}
              </span>
            </div>
            <p className="mug-desc">{m.desc}</p>
            <div className="mug-pick" onClick={() => goToCustomizer(m.id)}>
              Personalizar este modelo →
            </div>
          </div>
        </article>
      ))}
    </>
  );
}
