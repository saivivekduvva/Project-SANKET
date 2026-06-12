import React from 'react';
import { Info } from 'lucide-react';

const InsightsPanel = ({ latestData, isBaselining }) => {
  if (isBaselining) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Info size={18} color="var(--text-secondary)" />
          <h4 style={styles.title}>Real-Time Interpretation</h4>
        </div>
        <p style={styles.text}>
          The AI is currently establishing the subject's behavioral baseline. No interpretations can be made until the 3-minute calibration is complete to ensure legal compliance.
        </p>
      </div>
    );
  }

  if (!latestData) {
    return null;
  }

  // Extract the latest probabilities
  const { gazeProbability, pitchProbability, postureProbability } = latestData;

  // Threshold for "High Deviation"
  const THRESHOLD = 0.80;

  const getInsights = () => {
    const insights = [];

    if (gazeProbability > THRESHOLD) {
      insights.push({
        type: 'Gaze Deviation',
        color: '#5E5CE6',
        text: 'The subject is frequently breaking eye contact or scanning. This often correlates with increased cognitive load, accessing memories, or psychological distress.'
      });
    }
    
    if (pitchProbability > THRESHOLD) {
      insights.push({
        type: 'Head Pitch Anomaly',
        color: '#FF3B30',
        text: 'Significant vertical head movement detected. Investigators should watch for physical incongruence (e.g., nodding "yes" while saying "no").'
      });
    }

    if (postureProbability > THRESHOLD) {
      insights.push({
        type: 'Postural Shift',
        color: '#34C759',
        text: 'The subject has physically repositioned away from their baseline posture. This physical distancing can indicate discomfort or a desire to disengage from the current line of questioning.'
      });
    }

    if (insights.length === 0) {
      return (
        <p style={styles.baselineText}>
          The subject's non-verbal cues are currently consistent with their established baseline. No significant deviations detected.
        </p>
      );
    }

    return insights.map((insight, idx) => (
      <div key={idx} style={styles.insightRow}>
        <div style={{ ...styles.indicator, backgroundColor: insight.color }}></div>
        <div>
          <span style={styles.insightType}>{insight.type}:</span>
          <span style={styles.insightText}>{insight.text}</span>
        </div>
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Info size={18} color="var(--text-secondary)" />
        <h4 style={styles.title}>Real-Time Interpretation</h4>
      </div>
      <div style={styles.content}>
        {getInsights()}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '2rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.02)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '0.75rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
  },
  text: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
  baselineText: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
    fontStyle: 'italic',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  insightRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  insightType: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginRight: '0.5rem',
    fontSize: '0.95rem',
  },
  insightText: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  }
};

export default InsightsPanel;
