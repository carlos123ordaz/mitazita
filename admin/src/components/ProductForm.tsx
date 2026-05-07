import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, authHeaders } from '../services/api';

export default function ProductForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState('Diseños exclusivos');
  const [stock, setStock] = useState('99');
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !token) return;
    api.get(`/products/${id}`, authHeaders(token))
      .then((r) => {
        const p = r.data;
        setName(p.name);
        setDescription(p.description || '');
        setPrice(String(p.price));
        setOldPrice(p.oldPrice ? String(p.oldPrice) : '');
        setCategory(p.category || 'Diseños exclusivos');
        setStock(String(p.stock ?? 99));
        setActive(p.active);
        setImageUrl(p.imageUrl);
        setImagePreview(p.imageUrl);
      })
      .catch(() => setError('No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id, isEdit, token]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim() || !price) { setError('Nombre y precio son requeridos'); return; }
    if (!isEdit && !imageFile) { setError('Se requiere una imagen'); return; }

    setSaving(true);
    setError('');

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('description', description.trim());
    fd.append('price', price);
    fd.append('oldPrice', oldPrice);
    fd.append('category', category);
    fd.append('stock', stock);
    fd.append('active', String(active));
    if (imageFile) fd.append('image', imageFile);

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--ink-soft)' }}>Cargando…</p>;

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/products')}>← Volver</button>
      <h1 style={s.title}>{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      <form onSubmit={handleSubmit} style={s.form}>
        {/* Image */}
        <div style={s.imgSection}>
          <div
            style={{ ...s.imgDrop, ...(imagePreview ? s.imgDropFilled : {}) }}
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={s.imgPreview} />
            ) : (
              <div style={s.imgPlaceholder}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 15-5-5L5 19"/></svg>
                <p style={{ fontSize: 13, marginTop: 8, color: 'var(--ink-soft)' }}>Subir imagen</p>
                <p style={{ fontSize: 11, color: 'var(--ink-mute)' }}>JPG · PNG · hasta 8MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} hidden />
          </div>
          {imagePreview && (
            <button type="button" style={s.changeImg} onClick={() => fileRef.current?.click()}>
              Cambiar imagen
            </button>
          )}
        </div>

        {/* Fields */}
        <div style={s.fields}>
          <Field label="Nombre *" value={name} onChange={setName} placeholder="Taza Girasoles en Verano" />
          <Field label="Descripción" value={description} onChange={setDescription} placeholder="Descripción del diseño…" textarea />

          <div style={s.row2}>
            <Field label="Precio S/ *" value={price} onChange={setPrice} type="number" placeholder="45" />
            <Field label="Precio anterior S/ (tachado)" value={oldPrice} onChange={setOldPrice} type="number" placeholder="55" />
          </div>
          <div style={s.row2}>
            <Field label="Categoría" value={category} onChange={setCategory} placeholder="Diseños exclusivos" />
            <Field label="Stock" value={stock} onChange={setStock} type="number" placeholder="99" />
          </div>

          <label style={s.toggle}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span style={{ marginLeft: 8, fontSize: 14 }}>
              Publicado (visible en el sitio)
            </span>
          </label>

          {error && <p style={s.error}>{error}</p>}

          <div style={s.footBtns}>
            <button type="button" style={s.btnCancel} onClick={() => navigate('/products')}>Cancelar</button>
            <button type="submit" disabled={saving} style={s.btnSave}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', textarea,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid var(--line)', fontSize: 15,
    color: 'var(--ink)', background: 'var(--paper)', outline: 'none',
    fontFamily: 'inherit', resize: 'vertical',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', letterSpacing: '.04em' }}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={inputStyle} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 860, margin: '0 auto' },
  back: { fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', padding: '0 0 20px', display: 'block' },
  title: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, marginBottom: 28 },
  form: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'flex-start' },
  imgSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  imgDrop: {
    aspectRatio: '1/1', borderRadius: 14, border: '2px dashed var(--line)',
    background: 'var(--bg-soft)', cursor: 'pointer', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .2s',
  },
  imgDropFilled: { border: '2px solid var(--line)', background: 'transparent' },
  imgPreview: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgPlaceholder: { textAlign: 'center', color: 'var(--ink-mute)', padding: 20 },
  changeImg: { fontSize: 12, color: 'var(--accent-deep)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 0 },
  fields: { display: 'flex', flexDirection: 'column', gap: 16 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  toggle: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14 },
  error: { fontSize: 13, color: 'var(--danger)', background: '#fdf2f2', padding: '10px 14px', borderRadius: 8 },
  footBtns: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  btnCancel: { padding: '11px 22px', borderRadius: 999, border: '1.5px solid var(--line)', fontSize: 14, cursor: 'pointer' },
  btnSave: { padding: '11px 26px', borderRadius: 999, background: 'var(--ink)', color: 'var(--bg)', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
};
