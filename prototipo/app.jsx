// App entry: mount sub-roots + tweaks
const { TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "blush",
  "fonts": "cormorant-dm"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.body.dataset.palette = t.palette;
    document.body.dataset.fonts = t.fonts;
  }, [t.palette, t.fonts]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Paleta">
        <TweakRadio
          value={t.palette}
          onChange={(v) => setTweak("palette", v)}
          options={[
            { value: "blush",  label: "Blush" },
            { value: "coral",  label: "Coral" },
            { value: "rose",   label: "Rose" },
            { value: "ivory",  label: "Ivory" },
          ]}
        />
      </TweakSection>
      <TweakSection label="Tipografía">
        <TweakSelect
          value={t.fonts}
          onChange={(v) => setTweak("fonts", v)}
          options={[
            { value: "cormorant-dm", label: "Cormorant + DM Sans (default)" },
            { value: "playfair-manrope", label: "Playfair + Manrope" },
            { value: "italiana-outfit", label: "Italiana + Outfit" },
            { value: "tenor-dm", label: "Tenor Sans + DM Sans" },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

// Mount everything
const galleryRoot = document.getElementById("gallery-root");
if (galleryRoot) ReactDOM.createRoot(galleryRoot).render(<window.Gallery />);

const reviewsRoot = document.getElementById("reviews-root");
if (reviewsRoot) ReactDOM.createRoot(reviewsRoot).render(<window.Reviews />);

const customizerRoot = document.getElementById("customizer-root");
if (customizerRoot) ReactDOM.createRoot(customizerRoot).render(<window.Customizer />);

// Tweaks panel mount
const tweaksMount = document.createElement("div");
document.body.appendChild(tweaksMount);
ReactDOM.createRoot(tweaksMount).render(<App />);
