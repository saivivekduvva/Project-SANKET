import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

const ConsentModal = ({ onComplete }) => {
  const [language, setLanguage] = useState('English');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (isConsentGiven) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/compliance/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: 1, // Mocked subject
          session_id: 1, // Mocked session
          consent_given: isConsentGiven,
          document_hash: "mock_signature_hash_" + Math.random().toString(36).substr(2, 9),
          preferred_language: language
        })
      });
      
      if (response.ok) {
        onComplete(isConsentGiven);
      }
    } catch (err) {
      console.error("Error submitting consent:", err);
      // Fallback for UI if backend is not responsive
      onComplete(isConsentGiven);
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <ShieldAlert size={24} color="var(--text-primary)" />
          <h2 style={styles.title}>Legal Consent Required</h2>
        </div>
        
        <div style={styles.content}>
          <p style={styles.text}>
            In compliance with the <b>DPDP Act 2023</b> and <b>Article 20(3)</b>, explicit consent must be obtained from the subject before any AI behavioral telemetry can be collected.
          </p>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Subject's Preferred Language</label>
            <select 
              style={styles.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
              <option value="Tamil">Tamil</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)}
                style={styles.checkbox}
              />
              Subject verbally and physically consents to AI-assistive recording. (Mocks thumbprint/signature capture)
            </label>
          </div>
        </div>

        <div style={styles.footer}>
          <button 
            style={styles.denyButton} 
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            <XCircle size={16} />
            Refuse Consent (Fallback Mode)
          </button>
          
          <button 
            style={{ ...styles.acceptButton, opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
            onClick={() => handleSubmit(true)}
            disabled={!agreed || loading}
          >
            <CheckCircle size={16} />
            Confirm Consent & Start
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  content: {
    padding: '1.5rem',
  },
  text: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    backgroundColor: 'var(--bg-secondary)',
  },
  denyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light)',
    color: 'var(--text-secondary)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  acceptButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    backgroundColor: 'var(--text-primary)',
    border: 'none',
    color: 'var(--bg-primary)',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  }
};

export default ConsentModal;
