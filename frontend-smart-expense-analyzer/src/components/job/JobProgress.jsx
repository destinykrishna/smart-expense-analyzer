import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { pollJobStatus } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const STAGES = [
  { key: 'pending', label: 'Queued', threshold: 0 },
  { key: 'processing', label: 'Processing', threshold: 1 },
  { key: 'analyzing', label: 'ML Analysis', threshold: 50 },
  { key: 'completed', label: 'Complete', threshold: 100 },
];

export default function JobProgress({ jobId, onComplete }) {
  const { isDark } = useTheme();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const progressBarRef = useRef();
  const intervalRef = useRef();
  const animatedProgress = useRef(0);

  const poll = useCallback(async () => {
    try {
      const data = await pollJobStatus(jobId);
      setJob(data);

      // GSAP smooth progress bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${data.progress || 0}%`,
          duration: 0.8,
          ease: 'power2.out',
        });
      }

      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(intervalRef.current);
        if (data.status === 'completed') {
          setTimeout(() => onComplete(jobId), 1200);
        }
      }
    } catch (err) {
      setError('Failed to poll job status. Is the API running?');
      clearInterval(intervalRef.current);
    }
  }, [jobId, onComplete]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  const getStageIndex = () => {
    if (!job) return 0;
    if (job.status === 'completed') return 3;
    if (job.status === 'processing' && (job.progress || 0) >= 50) return 2;
    if (job.status === 'processing') return 1;
    return 0;
  };

  const stageIdx = getStageIndex();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto"
    >
      <div style={{
        background: isDark ? 'rgba(13,20,36,0.9)' : 'rgba(248,250,252,0.9)',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        borderRadius: 20,
        padding: 32,
        backdropFilter: 'blur(12px)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ marginBottom: 12 }}>
            <AnimatePresence mode="wait">
              {job?.status === 'completed' ? (
                <motion.div
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
                    border: '2px solid rgba(16,185,129,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-success)', margin: '0 auto',
                  }}
                >
                  <CheckIcon />
                </motion.div>
              ) : job?.status === 'failed' ? (
                <motion.div
                  key="fail"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.15)',
                    border: '2px solid rgba(239,68,68,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-danger)', margin: '0 auto',
                  }}
                >
                  <XIcon />
                </motion.div>
              ) : (
                <motion.div
                  key="spin"
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    border: '3px solid rgba(99,102,241,0.15)',
                    borderTopColor: '#6366f1',
                    margin: '0 auto',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </AnimatePresence>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text)', marginBottom: 4 }}>
            {job?.status === 'completed' ? 'Analysis Complete!' :
             job?.status === 'failed' ? 'Processing Failed' :
             'Analyzing Your Expenses'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Job ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>
              {jobId?.slice(0, 8)}…
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Progress
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)' }}>
              {job?.progress ?? 0}%
            </span>
          </div>
          <div style={{
            height: 8,
            background: isDark ? 'rgba(30,41,59,0.8)' : '#e2e8f0',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div
              ref={progressBarRef}
              style={{
                height: '100%',
                width: `${job?.progress ?? 0}%`,
                background: job?.status === 'completed'
                  ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                  : job?.status === 'failed'
                  ? '#ef4444'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                borderRadius: 4,
                transition: 'background 0.3s',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>

        {/* Stages */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 14,
            left: '12.5%',
            right: '12.5%',
            height: 1,
            background: isDark ? '#1e293b' : '#e2e8f0',
          }} />
          {STAGES.map((stage, i) => (
            <div key={stage.key} style={{ textAlign: 'center', zIndex: 1, flex: 1 }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: i <= stageIdx
                  ? (i === stageIdx && job?.status !== 'completed'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'linear-gradient(135deg, #10b981, #06b6d4)')
                  : (isDark ? '#1e293b' : '#e2e8f0'),
                border: `2px solid ${i <= stageIdx ? 'transparent' : (isDark ? '#334155' : '#cbd5e1')}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 6px',
                transition: 'all 0.3s',
                boxShadow: i === stageIdx && job?.status !== 'completed'
                  ? '0 0 12px rgba(99,102,241,0.5)'
                  : 'none',
              }}>
                {i < stageIdx || job?.status === 'completed' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, color: i <= stageIdx ? 'white' : 'var(--color-text-muted)' }}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: i <= stageIdx ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>

        {/* Meta info */}
        {job && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
          }}>
            {[
              { label: 'Status', value: job.status, badge: true },
              { label: 'Rows', value: job.rowCount ? job.rowCount.toLocaleString() : '—' },
            ].map((item) => (
              <div key={item.label} style={{
                background: isDark ? 'rgba(30,41,59,0.4)' : 'rgba(241,245,249,0.8)',
                borderRadius: 10,
                padding: '10px 14px',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </div>
                {item.badge ? (
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                ) : (
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--color-danger)', fontSize: 13,
            }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
