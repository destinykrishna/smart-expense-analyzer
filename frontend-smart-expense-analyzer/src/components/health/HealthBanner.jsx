import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function HealthBanner({ health, status }) {
  const { isDark } = useTheme();

  if (status === 'ok') return null; // hide when ok

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{
          position: 'fixed',
          top: 72,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          padding: '10px 20px',
          borderRadius: 12,
          background: status === 'checking'
            ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)')
            : (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'),
          border: `1px solid ${status === 'checking' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)'}`,
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: status === 'checking' ? 'var(--color-warning)' : 'var(--color-danger)',
          fontWeight: 500,
          maxWidth: 480,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        {status === 'checking' ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block', fontSize: 14 }}
          >
            ⟳
          </motion.span>
        ) : '⚠'}
        <span>
          {status === 'checking'
            ? 'Connecting to API server…'
            : `API server offline — some features unavailable. ${health?.mongo === 'connected' ? '' : 'MongoDB disconnected.'}`
          }
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
