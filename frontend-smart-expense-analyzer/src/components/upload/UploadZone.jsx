import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { uploadCSV } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const UploadIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

export default function UploadZone({ onJobCreated }) {
  const { isDark } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || 'demo-user-001');
  const inputRef = useRef();
  const zoneRef = useRef();
  const orbRef = useRef();

  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      setError(null);
    } else {
      setError('Please upload a valid .csv file');
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setError(null);
    } else {
      setError('Please upload a valid .csv file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    // GSAP pulse animation on button area
    if (orbRef.current) {
      gsap.to(orbRef.current, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
    }

    try {
      const result = await uploadCSV(file, userId);
      onJobCreated(result.jobId);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      const status = err.response?.status;
      if (status === 415) setError('Unsupported file type — please upload a .csv');
      else if (status === 400) setError('Invalid CSV — ensure it has id, date, description, amount columns');
      else if (status === 429) setError('Too many requests — max 10 uploads per hour');
      else setError(msg);
    } finally {
      setUploading(false);
      if (orbRef.current) gsap.killTweensOf(orbRef.current);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* User ID input */}
        <div className="mb-6">
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
            User ID (for session isolation)
          </label>
          <input
            className="input-field"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="e.g. demo-user-001"
          />
        </div>

        {/* Drop zone */}
        <motion.div
          ref={zoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          animate={{
            borderColor: isDragging
              ? '#6366f1'
              : isDark ? '#1e293b' : '#e2e8f0',
            backgroundColor: isDragging
              ? (isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)')
              : 'transparent',
          }}
          transition={{ duration: 0.2 }}
          style={{
            border: `2px dashed ${isDark ? '#1e293b' : '#e2e8f0'}`,
            borderRadius: 20,
            padding: '60px 40px',
            cursor: 'pointer',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated corner accents */}
          {isDragging && (
            <>
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    borderColor: '#6366f1',
                    borderStyle: 'solid',
                    borderWidth: 0,
                    ...(i === 0 ? { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 } : {}),
                    ...(i === 1 ? { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 } : {}),
                    ...(i === 2 ? { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2 } : {}),
                    ...(i === 3 ? { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2 } : {}),
                  }}
                />
              ))}
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <div ref={orbRef} className="float" style={{ display: 'inline-block', marginBottom: 20 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
                      : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}`,
                  }}>
                    <span style={{ color: 'var(--color-accent)' }}><UploadIcon /></span>
                  </div>
                </div>
                <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)', marginBottom: 8 }}>
                  {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                  or click to browse files
                </p>
                <div style={{
                  display: 'inline-flex', gap: 12, fontSize: 11,
                  color: 'var(--color-text-muted)',
                  background: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)',
                  padding: '6px 16px', borderRadius: 20,
                  border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                }}>
                  <span>CSV format</span>
                  <span>•</span>
                  <span>Required: id, date, description, amount</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 12, marginBottom: 8,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-success)',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}>
                    <FileIcon />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 14 }}>
                      {file.name}
                    </p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                      {(file.size / 1024).toFixed(1)} KB • CSV
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Click to change file</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--color-danger)',
                fontSize: 13,
              }}
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload button */}
        <motion.div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <motion.button
            className="btn-primary pulse-glow"
            onClick={handleUpload}
            disabled={!file || uploading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              minWidth: 200,
              padding: '13px 32px',
              fontSize: 15,
              justifyContent: 'center',
            }}
          >
            {uploading ? (
              <>
                <span className="spin-slow" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                Uploading…
              </>
            ) : (
              <>
                <UploadIcon />
                Analyze Expenses
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Info */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '🔒', title: 'Secure Upload', desc: 'Session-isolated per user' },
            { icon: '⚡', title: 'Async Processing', desc: 'Real-time progress tracking' },
            { icon: '🤖', title: 'ML Categorized', desc: 'Smart expense classification' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              style={{
                background: isDark ? 'rgba(13,20,36,0.8)' : 'rgba(248,250,252,0.8)',
                border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                borderRadius: 12,
                padding: '14px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
