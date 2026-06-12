import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const TelemetryCharts = ({ data, status }) => {
  // If we don't have enough data or we are in baselining state, show a subtle message
  const isBaselining = status === 'baselining';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Behavioral Probabilities</h3>
        <div style={styles.statusBadge(isBaselining)}>
          {isBaselining ? 'Baselining Engine Active...' : 'Monitoring Deviations'}
        </div>
      </div>
      
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
            <XAxis dataKey="time" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis 
              domain={[0, 1]} 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              itemStyle={{ fontWeight: '600' }}
            />
            
            {/* The 0.5 Baseline */}
            <ReferenceLine y={0.5} stroke="var(--text-secondary)" strokeDasharray="3 3" />
            
            <Line 
              type="monotone" 
              dataKey="gazeProbability" 
              name="Gaze Deviation"
              stroke="#5E5CE6" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="pitchProbability" 
              name="Head Pitch Deviation"
              stroke="#FF3B30" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
             <Line 
              type="monotone" 
              dataKey="postureProbability" 
              name="Posture Shift"
              stroke="#34C759" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {isBaselining && (
          <div style={styles.overlay}>
            <div style={styles.overlayBox}>
              <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Establishing Baseline</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Rule 3 Compliance: A 3-minute baseline is required before displaying probabilistic deviations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '2rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.02)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '600',
    letterSpacing: '-0.02em',
  },
  statusBadge: (isBaselining) => ({
    padding: '0.5rem 1.2rem',
    borderRadius: '24px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: isBaselining ? 'rgba(255, 149, 0, 0.1)' : 'rgba(52, 199, 89, 0.1)',
    color: isBaselining ? 'var(--status-baselining)' : 'var(--status-active)',
  }),
  chartWrapper: {
    flex: 1,
    minHeight: '300px',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: '8px',
  },
  overlayBox: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    maxWidth: '300px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  }
};

export default TelemetryCharts;
