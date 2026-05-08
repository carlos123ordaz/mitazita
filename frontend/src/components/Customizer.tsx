import { useState, useEffect, useMemo, useRef } from 'react';
import { MUG_MODELS, EXTRAS } from '../data';
import Mug from './Mug';
import { addToCart } from '../stores/cart';

const API_URL = (import.meta.env.PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

interface ExtrasState {
  caja: boolean;
  tarjeta: boolean;
  magica: boolean;
  delivery: boolean;
}

export default function Customizer() {
  const [step, setStep] = useState(1);
  const [modelId, setModelId] = useState('clasica');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mugName, setMugName] = useState('');
  const [dedication, setDedication] = useState('');
  const [extras, setExtras] = useState<ExtrasState>({ caja: false, tarjeta: false, magica: false, delivery: false });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setModelId(id);
      setStep(2);
    };
    window.addEventListener('mitazita:setModel', handler);
    return () => window.removeEventListener('mitazita:setModel', handler);
  }, []);

  const model = MUG_MODELS.find((m) => m.id === modelId) || MUG_MODELS[0];

  // Delivery is a flat per-order fee, not per mug — excluded from individual mug price
  const currentMugTotal = useMemo(() => {
    let t = model.price;
    EXTRAS.forEach((e) => {
      if (e.id === 'delivery') return;
      if (extras[e.id as keyof ExtrasState]) t += e.price;
    });
    return t;
  }, [model, extras]);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setUploadError('');
    const preview = URL.createObjectURL(file);
    setPhotoUrl(preview);

    const fd = new FormData();
    fd.append('photo', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/photo`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        URL.revokeObjectURL(preview);
        setPhotoUrl(data.url);
      }
    } catch {
      setUploadError('No se pudo subir la foto al servidor. Se usará la vista previa local.');
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) uploadPhoto(file);
  };

  const addMugToCart = () => {
    addToCart({
      type: 'mug',
      modelId: model.id,
      modelName: model.name,
      photoUrl,
      text: { name: mugName, dedication },
      extras: { ...extras },
      price: currentMugTotal,
    });
    setModelId('clasica');
    setPhotoUrl(null);
    setUploadError('');
    setMugName('');
    setDedication('');
    setExtras({ caja: false, tarjeta: false, magica: false, delivery: false });
    setStep(1);
    window.dispatchEvent(new CustomEvent('mitazita:openCart'));
  };

  const STEP_LABELS = [
    { n: 1, k: 'Modelo' },
    { n: 2, k: 'Foto' },
    { n: 3, k: 'Texto' },
    { n: 4, k: 'Extras' },
  ];

  return (
    <div className="cz">
      <div className="cz-grid">
        {/* Vista previa en vivo */}
        <div className="cz-preview">
          <div className="cz-preview-inner">
            <div className="cz-preview-stage">
              <Mug model={model} photoUrl={photoUrl} name={mugName} dedication={dedication} size={360} showPhoto />
            </div>
            <div className="cz-preview-foot">
              <div>
                <div className="cz-pf-label">VISTA PREVIA EN VIVO</div>
                <div className="cz-pf-name">{model.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="cz-pf-price">S/ {currentMugTotal}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario por pasos */}
        <div className="cz-form">
          <div className="cz-form-header">
            <div className="cz-steps">
              {STEP_LABELS.map((s) => (
                <button
                  key={s.n}
                  className={`cz-step${step === s.n ? ' active' : ''}${step > s.n ? ' done' : ''}`}
                  onClick={() => setStep(s.n)}
                >
                  <span className="cz-step-n">{step > s.n ? '✓' : `0${s.n}`}</span>
                  <span className="cz-step-k">{s.k}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cz-body">
            {/* PASO 1: Modelo */}
            {step === 1 && (
              <div className="cz-pane">
                <h3 className="cz-q">Elige el modelo de taza.</h3>
                <p className="cz-h">Cada estilo ya viene con su personalidad. Tú le pondrás el resto.</p>
                <div className="cz-models">
                  {MUG_MODELS.map((m) => (
                    <button
                      key={m.id}
                      className={`cz-model${modelId === m.id ? ' selected' : ''}`}
                      onClick={() => setModelId(m.id)}
                    >
                      <div className="cz-model-thumb">
                        <Mug model={m} size={100} showPhoto={false} />
                      </div>
                      <div className="cz-model-info">
                        <div className="cz-model-name">{m.name}</div>
                        <div className="cz-model-price">S/ {m.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 2: Foto */}
            {step === 2 && (
              <div className="cz-pane">
                <h3 className="cz-q">Sube la foto que va en la taza.</h3>
                <p className="cz-h">JPG o PNG, hasta 8MB. Si dudas, te ayudamos por WhatsApp.</p>
                <div
                  className={`cz-drop${photoUrl ? ' has-photo' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                >
                  <input type="file" accept="image/*" ref={fileRef} onChange={onPickFile} hidden />
                  {photoUrl ? (
                    <>
                      <img src={photoUrl} className="cz-drop-img" alt="Vista previa" />
                      <div className="cz-drop-overlay">{uploading ? 'Subiendo…' : 'Cambiar foto'}</div>
                    </>
                  ) : (
                    <>
                      <div className="cz-drop-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m21 15-5-5L5 19" />
                        </svg>
                      </div>
                      <div className="cz-drop-title">{uploading ? 'Subiendo…' : 'Arrastra una foto o haz clic'}</div>
                      <div className="cz-drop-sub">JPG · PNG · hasta 8MB</div>
                    </>
                  )}
                </div>
                {uploadError && <p className="cz-upload-warn">{uploadError}</p>}
                {photoUrl && !uploading && (
                  <button className="cz-link" onClick={() => { setPhotoUrl(null); setUploadError(''); }}>
                    Quitar foto
                  </button>
                )}
              </div>
            )}

            {/* PASO 3: Texto */}
            {step === 3 && (
              <div className="cz-pane">
                <h3 className="cz-q">Las palabras que ella va a leer.</h3>
                <p className="cz-h">Un nombre, un apodo, una frase. Lo simple suele emocionar más.</p>
                <div className="cz-field">
                  <label>Nombre o apodo</label>
                  <input
                    type="text"
                    placeholder="ej. Mami, Lucha, Madrecita…"
                    value={mugName}
                    maxLength={20}
                    onChange={(e) => setMugName(e.target.value)}
                  />
                  <span className="cz-count">{mugName.length}/20</span>
                </div>
                <div className="cz-field">
                  <label>Dedicatoria o frase</label>
                  <textarea
                    rows={3}
                    placeholder="ej. Gracias por todo lo que no se ve."
                    maxLength={80}
                    value={dedication}
                    onChange={(e) => setDedication(e.target.value)}
                  />
                  <span className="cz-count">{dedication.length}/80</span>
                </div>
                <div className="cz-suggestions">
                  <span className="cz-sug-label">Sugerencias:</span>
                  {['Gracias por todo, mamá.', 'Mi primera y eterna casa.', 'Te amo más que ayer.', 'Para la mejor del mundo.'].map((s) => (
                    <button key={s} className="cz-sug" onClick={() => setDedication(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4: Extras */}
            {step === 4 && (
              <div className="cz-pane">
                <h3 className="cz-q">El detalle final.</h3>
                <p className="cz-h">Extras opcionales. Marca solo lo que quieras agregar.</p>
                <div className="cz-extras">
                  {EXTRAS.filter((e) => e.id !== 'delivery').map((e) => (
                    <label key={e.id} className={`cz-extra${extras[e.id as keyof ExtrasState] ? ' on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={extras[e.id as keyof ExtrasState]}
                        onChange={(ev) => setExtras({ ...extras, [e.id]: ev.target.checked })}
                      />
                      <span className="cz-extra-check"></span>
                      <div className="cz-extra-text">
                        <div className="cz-extra-label">{e.label}</div>
                        <div className="cz-extra-desc">{e.desc}</div>
                      </div>
                      <div className="cz-extra-price">+S/ {e.price}</div>
                    </label>
                  ))}
                </div>

                <div className="cz-summary">
                  <h4>Esta taza</h4>
                  <div className="cz-sum-row"><span>{model.name}</span><span>S/ {model.price}</span></div>
                  {EXTRAS.filter((x) => x.id !== 'delivery' && extras[x.id as keyof ExtrasState]).map((x) => (
                    <div key={x.id} className="cz-sum-row"><span>+ {x.label}</span><span>S/ {x.price}</span></div>
                  ))}
                  <div className="cz-sum-row total"><span>Subtotal</span><span>S/ {currentMugTotal}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="cz-foot">
            {step > 1 ? (
              <button className="cz-back" onClick={() => setStep(step - 1)}>← Atrás</button>
            ) : (
              <span />
            )}

            <div className="cz-foot-right">
              {step === 4 ? (
                <button className="btn btn-primary" onClick={addMugToCart}>
                  Agregar al carrito
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                  Siguiente
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{customizerCss}</style>
    </div>
  );
}

const customizerCss = `
  .cz { background: var(--paper); border-radius: 20px; border: 1px solid var(--line); overflow: hidden; box-shadow: var(--shadow-soft); }
  .cz-grid { display: grid; grid-template-columns: 1.05fr 1.1fr; min-height: 640px; }
  @media (max-width: 920px) {
    .cz-grid { grid-template-columns: 1fr; min-height: unset; }
    .cz-form { order: 1; }
    .cz-preview { order: 2; padding: 20px 24px 28px; }
    .cz-preview-stage { padding: 8px 0; overflow: hidden; }
    .cz-preview-stage svg { width: min(260px, 62vw) !important; height: auto !important; }
    .cz-pf-name { font-size: 18px; }
    .cz-pf-price { font-size: 26px; }
  }

  .cz-preview {
    background: linear-gradient(180deg, var(--bg-soft) 0%, color-mix(in oklab, var(--bg-soft) 70%, var(--paper)) 100%);
    padding: 32px; display: flex; flex-direction: column;
  }
  .cz-preview-inner { flex: 1; display: flex; flex-direction: column; }
  .cz-preview-stage {
    flex: 1; display: flex; align-items: center; justify-content: center;
    padding: 28px 0 12px;
  }
  .cz-preview-foot {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 22px; border-top: 1px solid color-mix(in oklab, var(--line) 80%, transparent);
  }
  .cz-pf-label { font-size: 10px; letter-spacing: .18em; color: var(--ink-soft); }
  .cz-pf-name { font-family: var(--font-display); font-size: 22px; margin-top: 4px; }
  .cz-pf-price { font-family: var(--font-display); font-size: 36px; color: var(--accent-deep); font-weight: 500; }

  .cz-form { padding: 32px 36px 28px; display: flex; flex-direction: column; }
  @media (max-width: 540px) {
    .cz-form { padding: 22px 18px 20px; }
    .cz-q { font-size: 22px; }
    .cz-drop { aspect-ratio: 4/3; }
    .cz-extra { padding: 11px 12px; gap: 10px; }
    .cz-extra-label { font-size: 13px; }
    .cz-summary { padding: 14px; }
    .cz-sum-row.total { font-size: 18px; }
  }

  .cz-form-header { margin-bottom: 28px; }
  .cz-steps { display: flex; gap: 6px; flex-wrap: wrap; }
  .cz-step {
    flex: 1; display: flex; flex-direction: column; align-items: flex-start;
    padding: 10px 0 12px; border-top: 2px solid var(--line);
    color: var(--ink-mute); transition: all .25s; gap: 4px; min-width: 56px;
  }
  .cz-step.active { border-color: var(--accent); color: var(--ink); }
  .cz-step.done { border-color: var(--accent-deep); color: var(--ink-soft); }
  .cz-step-n { font-size: 11px; letter-spacing: .14em; font-weight: 600; }
  .cz-step-k { font-size: 12px; font-weight: 500; }

  .cz-body { flex: 1; }
  .cz-pane { animation: fade .35s ease; }
  @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  .cz-q { font-family: var(--font-display); font-size: 28px; line-height: 1.15; letter-spacing: -.01em; }
  .cz-h { color: var(--ink-soft); margin-top: 6px; font-size: 14px; }

  .cz-models { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 22px; }
  @media (max-width: 540px) { .cz-models { grid-template-columns: repeat(2, 1fr); } }
  .cz-model {
    border: 1.5px solid var(--line); border-radius: 12px; padding: 12px 12px 14px;
    background: var(--paper); text-align: left;
    display: flex; flex-direction: column; gap: 8px; transition: all .2s;
  }
  .cz-model:hover { border-color: color-mix(in oklab, var(--accent) 50%, var(--line)); }
  .cz-model.selected { border-color: var(--accent-deep); background: color-mix(in oklab, var(--accent) 8%, var(--paper)); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 14%, transparent); }
  .cz-model-thumb {
    aspect-ratio: 1/1; background: var(--bg-soft); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .cz-model-info { display: flex; justify-content: space-between; align-items: baseline; }
  .cz-model-name { font-family: var(--font-display); font-size: 16px; }
  .cz-model-price { font-size: 12px; color: var(--ink-soft); }

  .cz-drop {
    margin-top: 22px; aspect-ratio: 16/9;
    border: 2px dashed color-mix(in oklab, var(--accent) 45%, var(--line));
    background: color-mix(in oklab, var(--accent) 5%, var(--paper));
    border-radius: 14px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; color: var(--ink-soft); cursor: pointer;
    transition: all .2s; position: relative; overflow: hidden;
  }
  .cz-drop:hover { background: color-mix(in oklab, var(--accent) 10%, var(--paper)); border-color: var(--accent); }
  .cz-drop.has-photo { padding: 0; border-style: solid; border-color: var(--line); }
  .cz-drop-img { width: 100%; height: 100%; object-fit: cover; }
  .cz-drop-overlay {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,.35); color: white; opacity: 0; transition: opacity .2s; font-size: 14px; font-weight: 500;
  }
  .cz-drop:hover .cz-drop-overlay { opacity: 1; }
  .cz-drop-icon { color: var(--accent-deep); }
  .cz-drop-title { color: var(--ink); font-weight: 500; }
  .cz-drop-sub { font-size: 12px; }
  .cz-upload-warn { font-size: 12px; color: #b97a30; margin-top: 8px; }
  .cz-link { color: var(--accent-deep); font-size: 13px; margin-top: 12px; text-decoration: underline; padding: 0; display: block; }

  .cz-field { margin-top: 14px; position: relative; }
  .cz-field label { font-size: 12px; letter-spacing: .04em; color: var(--ink-soft); display: block; margin-bottom: 5px; font-weight: 500; }
  .cz-field input, .cz-field textarea {
    width: 100%; padding: 12px 14px; border-radius: 10px;
    border: 1.5px solid var(--line); background: var(--paper);
    font-family: var(--font-body); font-size: 15px; color: var(--ink);
    transition: border-color .2s; resize: none;
  }
  .cz-field input:focus, .cz-field textarea:focus { outline: none; border-color: var(--accent-deep); }
  .cz-count { position: absolute; right: 12px; bottom: 10px; font-size: 11px; color: var(--ink-mute); pointer-events: none; }

  .cz-suggestions { margin-top: 20px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .cz-sug-label { font-size: 12px; color: var(--ink-soft); margin-right: 4px; }
  .cz-sug {
    padding: 6px 12px; border-radius: 999px;
    background: var(--bg-soft); font-size: 12px;
    border: 1px solid transparent; transition: all .2s;
    font-family: var(--font-display); font-style: italic; color: var(--ink);
  }
  .cz-sug:hover { background: var(--paper); border-color: var(--accent); color: var(--accent-deep); }

  .cz-extras { display: flex; flex-direction: column; gap: 10px; margin-top: 22px; }
  .cz-extra {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; border-radius: 12px;
    border: 1.5px solid var(--line);
    cursor: pointer; transition: all .2s; background: var(--paper);
  }
  .cz-extra:hover { border-color: color-mix(in oklab, var(--accent) 40%, var(--line)); }
  .cz-extra.on { border-color: var(--accent-deep); background: color-mix(in oklab, var(--accent) 6%, var(--paper)); }
  .cz-extra input { display: none; }
  .cz-extra-check {
    width: 20px; height: 20px; border-radius: 6px;
    border: 1.5px solid var(--ink-mute); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; transition: all .2s;
  }
  .cz-extra.on .cz-extra-check { background: var(--accent-deep); border-color: var(--accent-deep); }
  .cz-extra.on .cz-extra-check::after { content: "✓"; color: white; font-size: 12px; font-weight: 700; }
  .cz-extra-text { flex: 1; }
  .cz-extra-label { font-size: 14px; font-weight: 500; }
  .cz-extra-desc { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
  .cz-extra-price { font-family: var(--font-display); font-size: 16px; color: var(--ink); }

  .cz-summary {
    margin-top: 20px; padding: 18px; border-radius: 12px;
    background: var(--bg-soft); display: flex; flex-direction: column; gap: 8px;
  }
  .cz-summary h4 { font-family: var(--font-display); font-size: 18px; margin-bottom: 4px; font-weight: 500; }
  .cz-sum-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--ink-soft); }
  .cz-sum-row.total {
    padding-top: 10px; margin-top: 4px;
    border-top: 1px solid color-mix(in oklab, var(--line) 80%, transparent);
    color: var(--ink); font-weight: 500;
    font-family: var(--font-display); font-size: 22px;
  }
  .cz-sum-row.total span:last-child { color: var(--accent-deep); }

  .cz-foot {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 20px; margin-top: 20px;
    border-top: 1px solid var(--line); gap: 12px;
  }
  .cz-foot-right { display: flex; gap: 10px; align-items: center; }
  .cz-back { font-size: 14px; color: var(--ink-soft); padding: 8px 0; }
  .cz-back:hover { color: var(--ink); }
  @media (max-width: 540px) { .cz-foot .btn { padding: 13px 16px; font-size: 13px; } }
`;
