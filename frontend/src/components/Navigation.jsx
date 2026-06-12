import React from 'react';
import { Camera, ShieldCheck, Settings } from 'lucide-react';

const Navigation = ({ sessionActive, onToggleSession }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
          <div style={styles.dot}></div>
        </div>
        <span style={styles.logoText}>sanket.</span>
      </div>

      <div style={styles.links}>
        <span style={styles.link}>Officer Dashboard</span>
        <span style={styles.link}>Audit Logs</span>
        <span style={styles.link}>Compliance</span>
        <span style={styles.link}>Settings</span>
      </div>

      <div style={styles.actions}>
        <span style={styles.lang}>EN </span>
        <button 
          style={sessionActive ? styles.buttonActive : styles.buttonInactive}
          onClick={onToggleSession}
        >
          {sessionActive ? 'End Interview' : 'Start Session'}
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 4rem',
    borderBottom: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-primary)',
  },
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
  links: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  lang: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  buttonInactive: {
    backgroundColor: 'var(--text-primary)',
    color: 'var(--bg-primary)',
    border: 'none',
    padding: '0.6rem 1.5rem',
    borderRadius: '24px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.5rem',
    borderRadius: '24px',
    fontWeight: '500',
    cursor: 'pointer',
  }
};

export default Navigation;
