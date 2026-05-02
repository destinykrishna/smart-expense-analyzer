import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { fetchTransactions } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Shopping': '#8b5cf6',
  'Transport': '#06b6d4',
  'Entertainment': '#ec4899',
  'Health': '#10b981',
  'Bills & Utilities': '#ef4444',
  'Travel': '#6366f1',
  'Income': '#10b981',
};

const getCategoryColor = (cat) =>
  CATEGORY_COLORS[cat] || '#64748b';

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

export default function TransactionTable({ jobId }) {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const tableRef = useRef();

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchTransactions(jobId, {
          page,
          limit: 50,
          category: categoryFilter || undefined,
        });
        setTransactions(data.transactions || []);
        setPagination(data.pagination);

        // Collect unique categories
        const cats = [...new Set((data.transactions || []).map(t => t.category).filter(Boolean))];
        setCategories(prev => [...new Set([...prev, ...cats])]);

        // GSAP stagger rows
        if (tableRef.current) {
          const rows = tableRef.current.querySelectorAll('.txn-row');
          gsap.from(rows, {
            opacity: 0,
            y: 12,
            stagger: 0.04,
            duration: 0.35,
            ease: 'power2.out',
          });
        }
      } catch (err) {
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId, page, categoryFilter]);

  const filtered = searchQuery
    ? transactions.filter(t =>
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input-field"
            style={{ paddingLeft: 34 }}
            placeholder="Search description or category…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)' }}>
          <FilterIcon />
          <select
            className="input-field"
            style={{ width: 'auto', minWidth: 160 }}
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Pagination info */}
        {pagination && (
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {pagination.total} total transactions
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: isDark ? 'rgba(13,20,36,0.9)' : 'rgba(248,250,252,0.9)',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 100px 120px 90px 70px',
          padding: '12px 20px',
          borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          background: isDark ? 'rgba(30,41,59,0.4)' : 'rgba(241,245,249,0.8)',
        }}>
          {['Date', 'Description', 'Amount', 'Category', 'Confidence', 'Tags'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Body */}
        <div ref={tableRef}>
          <AnimatePresence mode="wait">
            {loading ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '3px solid rgba(99,102,241,0.15)',
                    borderTopColor: '#6366f1',
                    margin: '0 auto',
                  }}
                />
              </div>
            ) : error ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--color-danger)', fontSize: 13 }}>
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                No transactions found
              </div>
            ) : (
              filtered.map((txn, i) => (
                <div
                  key={txn.txnId || i}
                  className="txn-row table-row-hover"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 100px 120px 90px 70px',
                    padding: '13px 20px',
                    borderBottom: `1px solid ${isDark ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.5)'}`,
                    alignItems: 'center',
                  }}
                >
                  {/* Date */}
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  {/* Description */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {txn.description}
                    </div>
                    {txn.subcategory && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {txn.subcategory}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: txn.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                    fontFamily: 'monospace',
                  }}>
                    {txn.amount >= 0 ? '+' : ''}{txn.amount?.toFixed(2)}
                    <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2, opacity: 0.7 }}>
                      {txn.currency}
                    </span>
                  </span>

                  {/* Category */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px', borderRadius: 20,
                      fontSize: 11, fontWeight: 600,
                      background: `${getCategoryColor(txn.category)}18`,
                      color: getCategoryColor(txn.category),
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: getCategoryColor(txn.category) }} />
                      {txn.category || 'Unknown'}
                    </span>
                    {txn.isLowConfidence && (
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--color-warning)', marginTop: 2 }}>⚠ Low confidence</span>
                    )}
                  </div>

                  {/* Confidence */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 3 }}>
                      {txn.confidence != null ? `${(txn.confidence * 100).toFixed(0)}%` : '—'}
                    </div>
                    {txn.confidence != null && (
                      <div style={{ height: 3, background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: 2 }}>
                        <div style={{
                          height: '100%',
                          width: `${(txn.confidence * 100).toFixed(0)}%`,
                          background: txn.confidence > 0.8 ? '#10b981' : txn.confidence > 0.5 ? '#f59e0b' : '#ef4444',
                          borderRadius: 2,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(txn.tags || []).map(tag => (
                      <span key={tag} style={{
                        padding: '2px 6px', borderRadius: 4,
                        fontSize: 10, fontWeight: 600,
                        background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
                        color: 'var(--color-accent)',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              background: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)',
              color: 'var(--color-text)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.4 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft />
          </button>

          {Array.from({ length: Math.min(7, pagination.pages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `1px solid ${p === page ? 'transparent' : (isDark ? '#1e293b' : '#e2e8f0')}`,
                  background: p === page
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : (isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)'),
                  color: p === page ? 'white' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: p === page ? 700 : 500,
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              background: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)',
              color: 'var(--color-text)',
              cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
              opacity: page === pagination.pages ? 0.4 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </motion.div>
  );
}
