import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>Mi Tazita<span style={styles.dot}></span></h1>
          <p style={styles.sub}>Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mitazita.pe"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 20,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: 'var(--shadow-lift)',
  },
  header: { textAlign: 'center', marginBottom: 36 },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 500,
    letterSpacing: '-0.01em',
    margin: '0 0 8px',
    color: 'var(--ink)',
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--accent)',
    marginLeft: 4,
    verticalAlign: 'middle',
    transform: 'translateY(-2px)',
  },
  sub: { fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '.04em' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', letterSpacing: '.04em' },
  input: {
    padding: '13px 16px',
    borderRadius: 10,
    border: '1.5px solid var(--line)',
    fontSize: 15,
    color: 'var(--ink)',
    background: 'var(--paper)',
    outline: 'none',
    transition: 'border-color .2s',
  },
  error: {
    fontSize: 13,
    color: 'var(--danger)',
    background: '#fdf2f2',
    padding: '10px 14px',
    borderRadius: 8,
    margin: 0,
  },
  btn: {
    marginTop: 4,
    padding: '14px',
    borderRadius: 999,
    background: 'var(--ink)',
    color: 'var(--bg)',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    border: 0,
    transition: 'background .2s',
  },
};
