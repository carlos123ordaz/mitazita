import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.logoWrap}>
            <span style={s.logo}>Mi Tazita</span>
            <span style={s.dot}></span>
          </div>
          <p style={s.adminName}>{admin?.name}</p>
        </div>

        <nav style={s.nav}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
            </svg>
            Pedidos
          </NavLink>

          <NavLink
            to="/products"
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            Diseños listos
          </NavLink>
        </nav>

        <button onClick={handleLogout} style={s.logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </aside>

      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 240, flexShrink: 0, background: 'var(--paper)',
    borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column',
    padding: '28px 20px', position: 'sticky', top: 0, height: '100vh',
  },
  sideTop: { marginBottom: 32 },
  logoWrap: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 },
  logo: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' },
  dot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' },
  adminName: { fontSize: 12, color: 'var(--ink-soft)' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
    color: 'var(--ink-soft)', transition: 'background .2s, color .2s',
  },
  navLinkActive: { background: 'var(--bg-soft)', color: 'var(--ink)' },
  logout: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 10, fontSize: 13,
    color: 'var(--ink-soft)', cursor: 'pointer', marginTop: 8,
  },
  main: { flex: 1, padding: '32px 40px', background: 'var(--bg)', minHeight: '100vh' },
};
