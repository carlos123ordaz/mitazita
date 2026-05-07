// Gallery grid
function Gallery() {
  const scrollToCustomizer = (modelId) => {
    if (window.__setCustomizerModel) window.__setCustomizerModel(modelId);
    document.getElementById("personalizar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {window.MUG_MODELS.map((m) => (
        <article key={m.id} className="mug-card">
          <div className="mug-photo" style={{ background: m.accent }}>
            {m.tag && <span className={`mug-tag ${m.isNew ? "new" : ""}`}>{m.tag}</span>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 20 }}>
              <window.Mug model={m} size={240} showPhoto={true} />
            </div>
          </div>
          <div className="mug-info">
            <div className="mug-info-top">
              <span className="mug-name">{m.name}</span>
              <span className="mug-price">
                {m.oldPrice && <s>S/ {m.oldPrice}</s>}S/ {m.price}
              </span>
            </div>
            <p className="mug-desc">{m.desc}</p>
            <div className="mug-pick" onClick={() => scrollToCustomizer(m.id)}>
              Personalizar este modelo →
            </div>
          </div>
        </article>
      ))}
    </>
  );
}

window.Gallery = Gallery;
