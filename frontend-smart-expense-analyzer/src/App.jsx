import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParticleField from './components/three/ParticleField';
import Navbar from './components/layout/Navbar';
import HealthBanner from './components/health/HealthBanner';
import UploadZone from './components/upload/UploadZone';
import JobProgress from './components/job/JobProgress';
import Dashboard from './components/dashboard/Dashboard';
import TransactionTable from './components/transactions/TransactionTable';
import { checkHealth } from './api/client';

function AppInner() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('upload');
  const [healthStatus, setHealthStatus] = useState('checking');
  const [health, setHealth] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
        setHealthStatus(data.status === 'ok' ? 'ok' : 'error');
      } catch {
        setHealthStatus('error');
      }
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleJobCreated = useCallback((id) => {
    setJobId(id);
    setShowProgress(true);
  }, []);

  const handleJobComplete = useCallback(() => {
    setShowProgress(false);
    setActiveTab('dashboard');
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };
  const transitionConfig = { duration: 0.3, ease: 'easeInOut' };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'var(--color-bg)' }}>
      <ParticleField />
      <HealthBanner health={health} status={healthStatus} />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} healthStatus={healthStatus} />

      <main style={{ paddingTop: 80, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

          <AnimatePresence mode="wait">
            {activeTab === 'upload' && !showProgress && (
              <motion.div
                key="upload-hero"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitionConfig}
                style={{ textAlign: 'center', marginBottom: 48 }}
              >
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 20, fontSize: 12,
                    fontWeight: 600, background: 'rgba(99,102,241,0.12)',
                    color: 'var(--color-accent)', border: '1px solid rgba(99,102,241,0.25)',
                    marginBottom: 20,
                  }}
                >
                  ✦ AI-Powered Expense Intelligence
                </motion.span>
                <h1 style={{
                  fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800,
                  letterSpacing: '-0.03em', lineHeight: 1.1,
                  marginBottom: 16, color: 'var(--color-text)',
                }}>
                  Analyze expenses{' '}
                  <span className="gradient-text">intelligently</span>
                </h1>
                <p style={{
                  fontSize: 'clamp(14px, 2vw, 17px)', color: 'var(--color-text-muted)',
                  maxWidth: 460, margin: '0 auto', lineHeight: 1.65,
                }}>
                  Upload your bank statement CSV and get AI-powered categorization, insights, and spending patterns — instantly.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitionConfig}
              >
                {showProgress ? (
                  <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                        Processing Your File
                      </h2>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                        Our ML engine is categorizing your transactions
                      </p>
                    </div>
                    <JobProgress jobId={jobId} onComplete={handleJobComplete} />
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <button
                        onClick={() => setShowProgress(false)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--color-text-muted)', fontSize: 13,
                          textDecoration: 'underline',
                        }}
                      >
                        Upload a different file
                      </button>
                    </div>
                  </div>
                ) : (
                  <UploadZone onJobCreated={handleJobCreated} />
                )}
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitionConfig}
              >
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                    Expense Dashboard
                  </h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    {jobId ? `Insights for job ${jobId.slice(0, 8)}…` : 'Upload a CSV to see your analytics'}
                  </p>
                </div>

                {!jobId ? (
                  <EmptyState
                    icon="📊" title="No Data Yet"
                    desc="Upload a CSV file to see your expense analysis"
                    onAction={() => setActiveTab('upload')}
                    isDark={isDark}
                  />
                ) : (
                  <Dashboard jobId={jobId} />
                )}
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                key="transactions"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitionConfig}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                      Transactions
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                      {jobId ? `Categorized results for job ${jobId.slice(0, 8)}…` : 'Upload a CSV to see transactions'}
                    </p>
                  </div>
                  {jobId && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 20,
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      fontSize: 12, fontWeight: 600, color: 'var(--color-success)',
                    }}>
                      ✓ Analysis Complete
                    </span>
                  )}
                </div>

                {!jobId ? (
                  <EmptyState
                    icon="📋" title="No Transactions"
                    desc="Upload and analyze a CSV to see categorized transactions"
                    onAction={() => setActiveTab('upload')}
                    isDark={isDark}
                  />
                ) : (
                  <TransactionTable jobId={jobId} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer style={{
        borderTop: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        padding: '20px 24px', textAlign: 'center',
        fontSize: 12, color: 'var(--color-text-muted)',
        position: 'relative', zIndex: 1,
        background: isDark ? 'rgba(8,12,20,0.8)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ fontWeight: 600 }}>SpendLens</span>
        <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
        <span>Smart Expense Analyzer v1.0</span>
        {health && (
          <>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <span style={{ color: health.mongo === 'connected' ? 'var(--color-success)' : 'var(--color-danger)' }}>
              MongoDB {health.mongo}
            </span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <span style={{ color: health.redis === 'connected' ? 'var(--color-success)' : 'var(--color-danger)' }}>
              Redis {health.redis}
            </span>
          </>
        )}
      </footer>
    </div>
  );
}

function EmptyState({ icon, title, desc, onAction, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center', padding: '80px 40px',
        background: isDark ? 'rgba(13,20,36,0.6)' : 'rgba(248,250,252,0.8)',
        border: `2px dashed ${isDark ? '#1e293b' : '#e2e8f0'}`,
        borderRadius: 20,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, fontSize: 18 }}>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>{desc}</p>
      <button className="btn-primary" onClick={onAction}>Get Started</button>
    </motion.div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
