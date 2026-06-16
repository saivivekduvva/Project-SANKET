import React from 'react';
import { Camera, ShieldCheck, Settings } from 'lucide-react';

const Navigation = ({ sessionActive, onStopSession, onStartRecording, onUploadData, currentView, setCurrentView, onDistress }) => {
  return (
    <nav className="nav">
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
        </div>
        <span style={styles.logoText}>sanket.</span>
      </div>

      <div className="nav-links">
        <span 
          className={currentView === 'dashboard' ? 'nav-link active' : 'nav-link'}
          onClick={() => setCurrentView('dashboard')}
        >
          Officer Dashboard
        </span>
        <span 
          className={currentView === 'compliance' ? 'nav-link active' : 'nav-link'}
          onClick={() => setCurrentView('compliance')}
        >
          Compliance
        </span>
      </div>

      <div style={styles.actions}>
        {sessionActive && (
          <button 
            className="nav-btn danger-outline"
            onClick={onDistress}
          >
            Halt AI (Distress)
          </button>
        )}
        {sessionActive ? (
          <button className="nav-btn danger" onClick={onStopSession}>
            End Interview
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="nav-btn" onClick={onStartRecording}>
              Start Recording
            </button>
            <button className="nav-btn" onClick={onUploadData}>
              Upload Data
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2px',
    width: '16px',
    height: '16px',
  },
  dot: {
    backgroundColor: 'var(--text-primary)',
    borderRadius: '50%',
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.05em',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  }
};

export default Navigation;
