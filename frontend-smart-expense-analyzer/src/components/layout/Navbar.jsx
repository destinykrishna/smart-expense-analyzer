import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import GlobeOrb from '../three/GlobeOrb';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Navbar({ activeTab, setActiveTab, healthStatus }) {
  const { isDark, toggle } = useTheme();

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: isDark ? 'rgba(8, 12, 20, 0.85)' : 'rgba(255,255,255,0.85)',
        borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{ width: 40, height: 40, marginLeft: -8 }}>
            <GlobeOrb size={40} />
          </div>
          <div>
            <span className="gradient-text font-bold text-lg tracking-tight">
              SpendLens
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 11, display: 'block', lineHeight: 1, marginTop: -2 }}>
              Smart Expense Analyzer
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1" style={{
          background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
          borderRadius: 12,
          padding: 4,
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                color: activeTab === tab.id
                  ? (isDark ? '#f1f5f9' : '#0f172a')
                  : 'var(--color-text-muted)',
                transition: 'color 0.2s',
                zIndex: 1,
              }}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="nav-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))'
                      : 'white',
                    borderRadius: 8,
                    boxShadow: isDark ? '0 2px 8px rgba(99,102,241,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: healthStatus === 'ok' ? 'var(--color-success)' : healthStatus === 'checking' ? 'var(--color-warning)' : 'var(--color-danger)',
              boxShadow: healthStatus === 'ok' ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
              display: 'inline-block',
            }} />
            <span className="hidden sm:inline">
              {healthStatus === 'ok' ? 'API Online' : healthStatus === 'checking' ? 'Checking...' : 'API Offline'}
            </span>
          </div>

          {/* Theme toggle */}
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(241, 245, 249, 0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#f59e0b' : '#6366f1',
            }}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
