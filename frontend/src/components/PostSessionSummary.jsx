import React, { useState } from 'react';
import { FileText, Lock, AlertTriangle, Download, RefreshCw, Trash2, Key } from 'lucide-react';

const PostSessionSummary = ({ telemetryData, onReset }) => {
  const [showExportForm, setShowExportForm] = useState(false);
  const [authorizingOfficerId, setAuthorizingOfficerId] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [erased, setErased] = useState(false);

  const handleExport = async () => {
    if (!authorizingOfficerId) {
      alert("Authorizing Officer ID is required for 2-officer export.");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/compliance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 1,
          requesting_officer_id: 1234, // Mocked IO
          authorizing_officer_id: parseInt(authorizingOfficerId),
          data_payload: "Session 1 Telemetry Data"
        })
      });
      
      if (response.ok) {
        setExportSuccess(true);
        setTimeout(() => {
          window.print(); // Trigger PDF print with signed data
        }, 500);
      } else {
        alert("Export failed: Ensure requesting and authorizing officers are different.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleErasure = async () => {
    if (window.confirm("WARNING: This will cryptographically destroy the session key. Data will be permanently unrecoverable. Proceed?")) {
      try {
        const response = await fetch('http://localhost:8000/api/v1/compliance/erase_session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: 1, officer_id: 1234 })
        });
        if (response.ok) {
          setErased(true);
          setTimeout(() => {
            onReset();
          }, 2000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (erased) {
    return (
      <div className="card" style={{...styles.container, textAlign: 'center', padding: '5rem'}}>
        <Trash2 size={48} color="#FF3B30" style={{marginBottom: '1rem'}} />
        <h2>Session Cryptographically Erased</h2>
        <p style={{color: 'var(--text-secondary)'}}>The encryption keys have been permanently destroyed. Returning to home...</p>
      </div>
    );
  }
  // Analyze telemetry data to find key anomalies
  const THRESHOLD = 0.80;
  
  const anomalies = [];
  
  telemetryData.forEach((point, index) => {
    if (point.gazeProbability > THRESHOLD) {
      anomalies.push({ time: point.time, type: 'Gaze Deviation', severity: point.gazeProbability });
    }
    if (point.pitchProbability > THRESHOLD) {
      anomalies.push({ time: point.time, type: 'Head Pitch Anomaly', severity: point.pitchProbability });
    }
    if (point.postureProbability > THRESHOLD) {
      anomalies.push({ time: point.time, type: 'Postural Shift', severity: point.postureProbability });
    }
  });

  // Keep only the 5 most significant anomalies to prevent flooding the UI
  const topAnomalies = anomalies
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .sort((a, b) => a.time.localeCompare(b.time)); // Chronological order

  return (
    <div className="card" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <FileText size={24} color="var(--text-primary)" />
          <h2 style={styles.title}>Post-Session Audit Report</h2>
        </div>
        <div style={styles.cryptoBadge}>
          <Lock size={14} />
          <span>SHA-256 Sealed</span>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Key Investigative Cues</h3>
          {topAnomalies.length > 0 ? (
            <ul style={styles.list}>
              {topAnomalies.map((anomaly, idx) => (
                <li key={idx} style={styles.listItem}>
                  <span style={styles.timestamp}>[{anomaly.time}]</span>
                  <div style={styles.anomalyType}>
                    <AlertTriangle size={14} color="#FF9500" />
                    <span style={{ fontWeight: '500' }}>{anomaly.type}</span>
                  </div>
                  <span style={styles.probability}>
                    {(anomaly.severity * 100).toFixed(1)}% Deviation
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={styles.emptyState}>
              <p>No significant behavioral deviations detected above the 80% threshold during this session.</p>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Admissibility & Chain of Custody</h3>
          <p style={styles.text}>
            In accordance with Indian evidentiary guidelines, the raw baseline data and probabilstic telemetry logs have been cryptographically hashed and sealed. 
          </p>
          <div style={styles.hashBox}>
            <code>Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--status-active)' }}>✓ Tamper-evident seal verified</p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={styles.sectionTitle}>Case-Record Linkage</h3>
            <div style={styles.linkageBox}>
              <div style={styles.linkageRow}>
                <span style={{ fontWeight: '600' }}>Active Case:</span>
                <span style={{ color: 'var(--text-secondary)' }}>CR-2026-892 (Financial Fraud)</span>
              </div>
              <div style={styles.linkageRow}>
                <span style={{ fontWeight: '600' }}>Subject ID:</span>
                <span style={{ color: 'var(--text-secondary)' }}>SUBJ-A (Consent Granted)</span>
              </div>
              <button style={styles.smallOutlineBtn}>Attach Log to Record</button>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={styles.sectionTitle}>Cross-Session Correlation</h3>
            <p style={styles.text}>
              Comparing this session's baseline against Subject A's previous interview (CR-2026-801).
            </p>
            <div style={styles.correlationBox}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Macro-Deviation Detected:</span>
              <span style={{ fontWeight: '600', color: '#FF9500' }}>Baseline Resting Pitch +12°</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        {!showExportForm && !exportSuccess && (
          <button style={styles.primaryButton} onClick={() => setShowExportForm(true)}>
            <Download size={16} style={{ marginRight: '8px' }} />
            Export Secure PDF
          </button>
        )}
        
        {showExportForm && !exportSuccess && (
          <div style={styles.exportForm}>
            <Key size={16} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Enter Authorizing Officer ID (e.g. 9999)" 
              style={styles.input}
              value={authorizingOfficerId}
              onChange={(e) => setAuthorizingOfficerId(e.target.value)}
            />
            <button style={{...styles.primaryButton, padding: '0.5rem 1rem'}} onClick={handleExport}>
              Authorize & Download
            </button>
          </div>
        )}
        
        {exportSuccess && (
          <span style={{color: 'var(--status-active)', fontWeight: '600', alignSelf: 'center'}}>
            ✓ Export Authorized & Signed
          </span>
        )}

        <button style={styles.secondaryButton} onClick={onReset}>
          <RefreshCw size={16} style={{ marginRight: '8px' }} />
          Start New Session
        </button>
        
        <div style={{ flex: 1 }}></div>
        
        <button style={styles.dangerGhostButton} onClick={handleErasure}>
          <Trash2 size={16} style={{ marginRight: '8px' }} />
          Erase Session
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '3rem',
    marginTop: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '1.5rem',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  cryptoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#F2F2F7',
    padding: '0.5rem 1rem',
    borderRadius: '24px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    marginBottom: '3rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  text: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
  },
  timestamp: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontFamily: 'monospace',
  },
  anomalyType: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    marginLeft: '1rem',
  },
  probability: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  emptyState: {
    padding: '2rem',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  hashBox: {
    backgroundColor: '#1C1C1E',
    padding: '1rem',
    borderRadius: '8px',
    color: '#E5E5EA',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    wordBreak: 'break-all',
  },
  footer: {
    display: 'flex',
    gap: '1rem',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '2rem',
  },
  primaryButton: {
    backgroundColor: 'var(--text-primary)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-dark)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  linkageBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    padding: '1rem',
  },
  linkageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  smallOutlineBtn: {
    marginTop: '1rem',
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    padding: '0.5rem',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  correlationBox: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    border: '1px solid #FF9500',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  exportForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
  },
  input: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '0.9rem',
    width: '250px',
  },
  dangerGhostButton: {
    backgroundColor: 'transparent',
    color: '#FF3B30',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  }
};

export default PostSessionSummary;
