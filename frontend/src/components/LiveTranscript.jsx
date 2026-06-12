import React, { useState, useEffect } from 'react';
import { MessagesSquare } from 'lucide-react';

const mockTranscript = [
  { time: '10:04:12', speaker: 'Officer', text: 'Can you state where you were on the night of the 14th?', lang: 'en' },
  { time: '10:04:15', speaker: 'Subject', text: 'I was at home. Main wahan nahi tha.', lang: 'mixed' },
  { time: '10:04:18', speaker: 'Officer', text: 'Are you sure? We have witnesses.', lang: 'en' },
  { time: '10:04:22', speaker: 'Subject', text: 'Haan, mujhe pakka yaad hai. I was watching TV.', lang: 'mixed', anomaly: 'Speech Rate Drop (Hesitation)' },
  { time: '10:04:27', speaker: 'Officer', text: 'Please describe the TV show.', lang: 'en' },
];

const LiveTranscript = ({ sessionActive }) => {
  const [lines, setLines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!sessionActive) {
      setLines([]);
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      if (currentIndex < mockTranscript.length) {
        setLines(prev => [...prev, mockTranscript[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }
    }, 4000); // New line every 4 seconds for realistic reading pace

    return () => clearInterval(interval);
  }, [sessionActive, currentIndex]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <MessagesSquare size={16} color="var(--text-secondary)" />
        <span style={styles.title}>Live Transcript (ASR & Code-Switching)</span>
      </div>
      <div style={styles.scrollArea}>
        {!sessionActive && lines.length === 0 ? (
          <p style={styles.placeholder}>Transcript will begin when session starts...</p>
        ) : (
          lines.map((line, idx) => (
            <div key={idx} style={styles.line}>
              <span style={styles.time}>[{line.time}]</span>
              <span style={line.speaker === 'Officer' ? styles.officer : styles.subject}>
                {line.speaker}:
              </span>
              <span style={styles.text}>
                {line.lang === 'mixed' ? (
                  // Highlight the Hindi parts loosely for the demo effect
                  <span dangerouslySetInnerHTML={{ __html: highlightHindi(line.text) }} />
                ) : (
                  line.text
                )}
              </span>
              {line.anomaly && (
                <div style={styles.anomalyBadge}>{line.anomaly}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Helper function to mock code-switching highlighting for the demo
const highlightHindi = (text) => {
  const hindiPhrases = ['Main wahan nahi tha.', 'Haan, mujhe pakka yaad hai.'];
  let newText = text;
  hindiPhrases.forEach(phrase => {
    newText = newText.replace(phrase, `<span style="color: #5E5CE6; font-style: italic;">${phrase}</span>`);
  });
  return newText;
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
  officer: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  subject: {
    fontWeight: '600',
    color: '#FF3B30',
  },
  text: {
    color: 'var(--text-primary)',
  },
  anomalyBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    color: '#FF9500',
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontWeight: '600',
    marginLeft: 'auto',
  }
};

export default LiveTranscript;
