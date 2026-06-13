import React, { useRef, useEffect } from 'react';
import { MessagesSquare } from 'lucide-react';

const LiveTranscript = ({ sessionActive, liveLines }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveLines]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <MessagesSquare size={16} color="var(--text-secondary)" />
        <span style={styles.title}>Live Transcript (ASR: 22 Scheduled Indian Languages Supported)</span>
      </div>
      <div style={styles.scrollArea} ref={scrollRef}>
        {!sessionActive && (!liveLines || liveLines.length === 0) ? (
          <p style={styles.placeholder}>Transcript will begin when session starts...</p>
        ) : (
          (liveLines || []).map((line, idx) => (
            <div key={idx} style={styles.line}>
              <span style={styles.time}>[{line.time}]</span>
              <span style={styles.subject}>Subject:</span>
              <span style={styles.text}>{line.text}</span>
              {line.language && line.language !== 'unknown' && (
                <span style={styles.badge}>Detected: {line.language}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '250px',
    marginTop: '1.5rem',
  },
  header: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--bg-secondary)',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  scrollArea: {
    padding: '1rem',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  placeholder: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: '2rem',
  },
  line: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  time: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
  },
  subject: {
    fontWeight: '600',
    color: '#FF3B30',
  },
  text: {
    color: 'var(--text-primary)',
  },
  badge: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    padding: '2px 6px',
    borderRadius: '12px',
    border: '1px solid var(--border-light)',
    color: 'var(--accent)',
    fontWeight: '600',
    marginLeft: '4px',
  }
};

export default LiveTranscript;
