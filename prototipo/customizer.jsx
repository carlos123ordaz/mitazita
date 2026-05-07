// Step-by-step customizer with live preview
const { useState, useEffect, useMemo, useRef } = React;

function Customizer() {
  const [step, setStep] = useState(1);
  const [modelId, setModelId] = useState("clasica");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [name, setName] = useState("");
  const [dedication, setDedication] = useState("");
  const [extras, setExtras] = useState({ caja: true, tarjeta: false, magica: false, delivery: true });
  const fileRef = useRef(null);

  // Expose model setter for gallery cards to jump in
  useEffect(() => {
    window.__setCustomizerModel = (id) => { setModelId(id); setStep(2); };
  }, []);

  const model = window.MUG_MODELS.find(m => m.id === modelId) || window.MUG_MODELS[0];

  const total = useMemo(() => {
    let t = model.price;
    window.EXTRAS.forEach(e => { if (extras[e.id]) t += e.price; });
    return t;
  }, [model, extras]);

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const buildWhatsApp = () => {
    const lines = [
      "Hola Mi Tazita 👋 Quiero pedir esta taza para mamá:",
      "",
      `• Modelo: ${model.name} — S/ ${model.price}`,
      photoUrl ? "• Foto: la envío en seguida 📸" : "• Foto: lo coordinamos por aquí",
      name ? `• Nombre: ${name}` : null,
      dedication ? `• Dedicatoria: "${dedication}"` : null,
      "",
      "Extras:",
      ...window.EXTRAS.filter(e => extras[e.id]).map(e => `  ✓ ${e.label} (+S/ ${e.price})`),
      "",
      `Total: S/ ${total}`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  };

  const steps = [
    { n: 1, k: "Modelo" },
    { n: 2, k: "Foto" },
    { n: 3, k: "Texto" },
    { n: 4, k: "Extras" },
  ];

  return (
    <div className="cz">
      <div className="cz-grid">
        {/* LEFT: Live Preview */}
        <div className="cz-preview">
          <div className="cz-preview-inner">
            <div className="cz-preview-stage">
              <window.Mug
                model={model}
                photoUrl={photoUrl}
                name={name}
                dedication={dedication}
                size={360}
                showPhoto={true}
              />
            </div>
            <div className="cz-preview-foot">
              <div>
                <div className="cz-pf-label">VISTA PREVIA EN VIVO</div>
                <div className="cz-pf-name">{model.name}</div>
              </div>
              <div className="cz-pf-price">S/ {total}</div>
            </div>
          </div>
        </div>

        {/* RIGHT: Stepper */}
        <div className="cz-form">
          {/* Step indicators */}
          <div className="cz-steps">
            {steps.map((s, i) => (
              <button key={s.n} className={`cz-step ${step === s.n ? "active" : ""} ${step > s.n ? "done" : ""}`} onClick={() => setStep(s.n)}>
                <span className="cz-step-n">{step > s.n ? "✓" : `0${s.n}`}</span>
                <span className="cz-step-k">{s.k}</span>
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="cz-body">
            {step === 1 && (
              <div className="cz-pane">
                <h3 className="cz-q">Elige el modelo de taza.</h3>
                <p className="cz-h">Cada estilo ya viene con su personalidad. Tú le pondrás el resto.</p>
                <div className="cz-models">
                  {window.MUG_MODELS.map(m => (
                    <button key={m.id}
                            className={`cz-model ${modelId === m.id ? "selected" : ""}`}
                            onClick={() => setModelId(m.id)}>
                      <div className="cz-model-thumb">
                        <window.Mug model={m} size={100} showPhoto={false} />
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

            {step === 2 && (
              <div className="cz-pane">
                <h3 className="cz-q">Sube la foto que va en la taza.</h3>
                <p className="cz-h">JPG o PNG. Si es vertical, la encuadramos por ti. Si dudas, te ayudamos por WhatsApp.</p>
                <div
                  className={`cz-drop ${photoUrl ? "has-photo" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                >
                  <input type="file" accept="image/*" ref={fileRef} onChange={onPickFile} hidden />
                  {photoUrl ? (
                    <>
                      <img src={photoUrl} className="cz-drop-img" alt="" />
                      <div className="cz-drop-overlay">Cambiar foto</div>
                    </>
                  ) : (
                    <>
                      <div className="cz-drop-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 15-5-5L5 19"/>
                        </svg>
                      </div>
                      <div className="cz-drop-title">Arrastra una foto o haz clic</div>
                      <div className="cz-drop-sub">JPG · PNG · hasta 8MB</div>
                    </>
                  )}
                </div>
                {photoUrl && (
                  <button className="cz-link" onClick={() => setPhotoUrl(null)}>Quitar foto</button>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="cz-pane">
                <h3 className="cz-q">Las palabras que ella va a leer.</h3>
                <p className="cz-h">Un nombre, un apodo, una frase. Lo simple suele emocionar más.</p>
                <div className="cz-field">
                  <label>Nombre o apodo</label>
                  <input type="text" placeholder="ej. Mami, Lucha, Madrecita…"
                         value={name} maxLength={20}
                         onChange={(e) => setName(e.target.value)} />
                  <span className="cz-count">{name.length}/20</span>
                </div>
                <div className="cz-field">
                  <label>Dedicatoria o frase</label>
                  <textarea rows={3} placeholder="ej. Gracias por todo lo que no se ve."
                            maxLength={80}
                            value={dedication}
                            onChange={(e) => setDedication(e.target.value)} />
                  <span className="cz-count">{dedication.length}/80</span>
                </div>
                <div className="cz-suggestions">
                  <span className="cz-sug-label">Sugerencias:</span>
                  {[
                    "Gracias por todo, mamá.",
                    "Mi primera y eterna casa.",
                    "Te amo más que ayer.",
                    "Para la mejor del mundo.",
                  ].map((s, i) => (
                    <button key={i} className="cz-sug" onClick={() => setDedication(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="cz-pane">
                <h3 className="cz-q">El detalle final.</h3>
                <p className="cz-h">Extras opcionales. Marca solo lo que quieras agregar.</p>
                <div className="cz-extras">
                  {window.EXTRAS.map(e => (
                    <label key={e.id} className={`cz-extra ${extras[e.id] ? "on" : ""}`}>
                      <input type="checkbox" checked={extras[e.id]}
                             onChange={(ev) => setExtras({ ...extras, [e.id]: ev.target.checked })} />
                      <span className="cz-extra-check"></span>
                      <div className="cz-extra-text">
                        <div className="cz-extra-label">{e.label}</div>
                        <div className="cz-extra-desc">{e.desc}</div>
                      </div>
                      <div className="cz-extra-price">+S/ {e.price}</div>
                    </label>
                  ))}
                </div>

                {/* Summary */}
                <div className="cz-summary">
                  <h4>Resumen del pedido</h4>
                  <div className="cz-sum-row"><span>Taza · {model.name}</span><span>S/ {model.price}</span></div>
                  {window.EXTRAS.filter(x => extras[x.id]).map(x => (
                    <div key={x.id} className="cz-sum-row"><span>+ {x.label}</span><span>S/ {x.price}</span></div>
                  ))}
                  <div className="cz-sum-row total"><span>Total</span><span>S/ {total}</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="cz-foot">
            {step > 1 ? (
              <button className="cz-back" onClick={() => setStep(step - 1)}>
                ← Atrás
              </button>
            ) : <span></span>}

            {step < 4 ? (
              <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                Siguiente
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            ) : (
              <a className="btn btn-wa"
                 href={`https://wa.me/51944073494?text=${buildWhatsApp()}`}
                 target="_blank" rel="noopener">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
                Confirmar por WhatsApp · S/ {total}
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cz { background: var(--paper); border-radius: 20px; border: 1px solid var(--line); overflow: hidden; box-shadow: var(--shadow-soft); }
        .cz-grid { display: grid; grid-template-columns: 1.05fr 1.1fr; min-height: 640px; }
        @media (max-width: 920px) { .cz-grid { grid-template-columns: 1fr; } }

        .cz-preview {
          background: linear-gradient(180deg, var(--bg-soft) 0%, color-mix(in oklab, var(--bg-soft) 70%, var(--paper)) 100%);
          padding: 32px;
          display: flex; flex-direction: column;
          position: relative;
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
        @media (max-width: 540px) { .cz-form { padding: 24px 20px; } }

        .cz-steps { display: flex; gap: 8px; margin-bottom: 28px; }
        .cz-step {
          flex: 1; display: flex; flex-direction: column; align-items: flex-start;
          padding: 10px 0 12px; border-top: 2px solid var(--line);
          color: var(--ink-mute); transition: all .25s;
          gap: 4px;
        }
        .cz-step.active { border-color: var(--accent); color: var(--ink); }
        .cz-step.done { border-color: var(--accent-deep); color: var(--ink-soft); }
        .cz-step-n { font-size: 11px; letter-spacing: .14em; font-weight: 600; }
        .cz-step-k { font-size: 13px; font-weight: 500; }

        .cz-body { flex: 1; }
        .cz-pane { animation: fade .35s ease; }
        @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        .cz-q { font-family: var(--font-display); font-size: 30px; line-height: 1.15; letter-spacing: -.01em; }
        .cz-h { color: var(--ink-soft); margin-top: 6px; font-size: 14px; }

        .cz-models {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 22px;
        }
        @media (max-width: 540px) { .cz-models { grid-template-columns: repeat(2, 1fr); } }
        .cz-model {
          border: 1.5px solid var(--line); border-radius: 12px; padding: 12px 12px 14px;
          background: var(--paper); text-align: left;
          display: flex; flex-direction: column; gap: 8px;
          transition: all .2s;
        }
        .cz-model:hover { border-color: color-mix(in oklab, var(--accent) 50%, var(--line)); }
        .cz-model.selected { border-color: var(--accent-deep); background: color-mix(in oklab, var(--accent) 8%, var(--paper)); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 14%, transparent); }
        .cz-model-thumb {
          aspect-ratio: 1/1; background: var(--bg-soft); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .cz-model-info { display: flex; justify-content: space-between; align-items: baseline; }
        .cz-model-name { font-family: var(--font-display); font-size: 16px; }
        .cz-model-price { font-size: 12px; color: var(--ink-soft); }

        .cz-drop {
          margin-top: 22px;
          aspect-ratio: 16/9;
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

        .cz-link { color: var(--accent-deep); font-size: 13px; margin-top: 12px; text-decoration: underline; padding: 0; }

        .cz-field { margin-top: 18px; position: relative; }
        .cz-field label { font-size: 12px; letter-spacing: .04em; color: var(--ink-soft); display: block; margin-bottom: 6px; font-weight: 500; }
        .cz-field input, .cz-field textarea {
          width: 100%; padding: 14px 16px; border-radius: 10px;
          border: 1.5px solid var(--line); background: var(--paper);
          font-family: var(--font-body); font-size: 15px; color: var(--ink);
          transition: border-color .2s;
          resize: none;
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
          cursor: pointer; transition: all .2s;
          background: var(--paper);
        }
        .cz-extra:hover { border-color: color-mix(in oklab, var(--accent) 40%, var(--line)); }
        .cz-extra.on { border-color: var(--accent-deep); background: color-mix(in oklab, var(--accent) 6%, var(--paper)); }
        .cz-extra input { display: none; }
        .cz-extra-check {
          width: 20px; height: 20px; border-radius: 6px;
          border: 1.5px solid var(--ink-mute); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .cz-extra.on .cz-extra-check {
          background: var(--accent-deep); border-color: var(--accent-deep);
        }
        .cz-extra.on .cz-extra-check::after {
          content: "✓"; color: white; font-size: 12px; font-weight: 700;
        }
        .cz-extra-text { flex: 1; }
        .cz-extra-label { font-size: 14px; font-weight: 500; }
        .cz-extra-desc { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
        .cz-extra-price { font-family: var(--font-display); font-size: 16px; color: var(--ink); }

        .cz-summary {
          margin-top: 24px; padding: 20px; border-radius: 12px;
          background: var(--bg-soft);
          display: flex; flex-direction: column; gap: 8px;
        }
        .cz-summary h4 { font-family: var(--font-display); font-size: 18px; margin-bottom: 6px; font-weight: 500; }
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
          padding-top: 24px; margin-top: 24px;
          border-top: 1px solid var(--line); gap: 12px;
        }
        .cz-back { font-size: 14px; color: var(--ink-soft); padding: 8px 0; }
        .cz-back:hover { color: var(--ink); }
        @media (max-width: 540px) {
          .cz-foot .btn { padding: 14px 18px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}

window.Customizer = Customizer;
