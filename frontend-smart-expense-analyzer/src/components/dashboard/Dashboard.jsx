import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import { fetchTransactions } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16'];

const CustomTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? 'rgba(13,20,36,0.95)' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(12px)',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{payload[0].name}</p>
      <p style={{ color: 'var(--color-accent)', fontWeight: 600 }}>${Math.abs(payload[0].value).toFixed(2)}</p>
    </div>
  );
};

function StatCard({ label, value, sub, icon, color, index }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current, {
        opacity: 0, y: 30,
        duration: 0.5,
        delay: index * 0.1,
        ease: 'power2.out',
      });
    }
  }, [index]);

  return (
    <div ref={ref} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at 80% 20%, ${color}20, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: color }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard({ jobId }) {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTransactions(jobId, { page: 1, limit: 200 });
        setTransactions(data.transactions || []);
        setPagination(data.pagination);
      } catch (err) {
        setError('Failed to load transactions data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  // Aggregate data
  const categoryMap = {};
  let totalSpend = 0;
  let totalIncome = 0;
  const monthMap = {};
  let lowConfidenceCount = 0;

  transactions.forEach(txn => {
    if (txn.isLowConfidence) lowConfidenceCount++;
    if (txn.amount < 0) totalSpend += Math.abs(txn.amount);
    else totalIncome += txn.amount;

    const cat = txn.category || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    if (txn.amount < 0) categoryMap[cat] += Math.abs(txn.amount);

    const month = new Date(txn.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
    if (txn.amount < 0) monthMap[month].expense += Math.abs(txn.amount);
    else monthMap[month].income += txn.amount;
  });

  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const barData = Object.entries(monthMap).map(([month, vals]) => ({
    month,
    Income: parseFloat(vals.income.toFixed(2)),
    Expense: parseFloat(vals.expense.toFixed(2)),
  }));

  const avgConfidence = transactions.length
    ? (transactions.reduce((s, t) => s + (t.confidence || 0), 0) / transactions.length * 100).toFixed(0)
    : 0;

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const axisColor = isDark ? '#475569' : '#94a3b8';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid rgba(99,102,241,0.15)',
            borderTopColor: '#6366f1',
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-danger)' }}>
        {error}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
        No transactions found for this job.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard index={0} icon="💸" label="Total Spend" value={`$${totalSpend.toFixed(2)}`} sub="All debits" color="#ef4444" />
        <StatCard index={1} icon="💰" label="Total Income" value={`$${totalIncome.toFixed(2)}`} sub="All credits" color="#10b981" />
        <StatCard index={2} icon="📊" label="Transactions" value={pagination?.total ?? transactions.length} sub={`${transactions.length} loaded`} color="#6366f1" />
        <StatCard index={3} icon="🤖" label="ML Confidence" value={`${avgConfidence}%`} sub={`${lowConfidenceCount} low-confidence`} color="#f59e0b" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 16 }}>
        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            Spend by Category
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 8 }}>
            {pieData.slice(0, 6).map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            Income vs Expenses by Month
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend wrapperStyle={{ fontSize: 12, color: axisColor }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: 'var(--color-text-muted)', fontSize: 13 }}>
              Not enough date data to build monthly chart
            </div>
          )}
        </motion.div>
      </div>

      {/* Area chart - running balance */}
      {transactions.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20 }}>
            Cumulative Spend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={[...transactions]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .filter(t => t.amount < 0)
                .reduce((acc, t, i) => {
                  const prev = acc[i - 1]?.total ?? 0;
                  acc.push({ date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), total: parseFloat((prev + Math.abs(t.amount)).toFixed(2)) });
                  return acc;
                }, [])
                .filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 30)) === 0)
              }
            >
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: isDark ? 'rgba(13,20,36,0.95)' : 'white', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`, borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ color: 'var(--color-accent)', fontWeight: 600 }}>${payload[0].value?.toFixed(2)}</p>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
