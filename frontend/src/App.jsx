import React, { useRef, useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import TelemetryCharts from './components/TelemetryCharts';
import InsightsPanel from './components/InsightsPanel';
import PostSessionSummary from './components/PostSessionSummary';
import ComplianceDashboard from './components/ComplianceDashboard';
import LiveTranscript from './components/LiveTranscript';

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [engineStatus, setEngineStatus] = useState('baselining'); // 'baselining' or 'monitoring'
  const [telemetryData, setTelemetryData] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [liveLines, setLiveLines] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const pollingRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // The backend requires a valid session_id. We seeded 1 earlier.
  const SESSION_ID = 1;

  // Toggle Session
  const handleToggleSession = async () => {
    if (sessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const startSession = async () => {
    try {
      // 1. Access Webcam and Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      setSessionActive(true);
      setSessionEnded(false);
      setTelemetryData([]);
      setLiveLines([]);
      
      // 2. Start polling the backend every 500ms (2 FPS for prototype)
      pollingRef.current = setInterval(captureAndSendFrame, 500);

      // 3. Start Audio Recording (5-second chunks)
      try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0) {
            sendAudioChunk(e.data);
          }
        };
        
        // Start recording, and slice data every 5000ms
        mediaRecorder.start(5000);
      } catch (err) {
        console.error("Audio recording not supported or failed:", err);
      }

    } catch (err) {
      console.error("Error accessing webcam: ", err);
      alert("Could not access webcam. Please allow camera permissions.");
    }
  };

  const stopSession = () => {
    setSessionActive(false);
    setSessionEnded(true);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const resetToHome = () => {
    setSessionEnded(false);
    setEngineStatus('baselining');
    setTelemetryData([]);
    setLiveLines([]);
  };

  // Capture frame and send to FastAPI
  const captureAndSendFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Draw current video frame to hidden canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to Blob (JPEG)
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      try {
        const response = await fetch(`http://localhost:8000/api/v1/inference/process_video?session_id=${SESSION_ID}`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          processBackendResult(result);
        } else {
          console.error("Backend error:", await response.text());
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }, 'image/jpeg', 0.8);
  };

  const sendAudioChunk = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'chunk.webm');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/inference/transcribe_chunk', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        if (result.text && result.text.trim() !== '') {
          setLiveLines(prev => [...prev, {
            time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
            text: result.text,
            language: result.language
          }]);
        }
      }
    } catch (err) {
      console.error("Transcription error:", err);
    }
  };

  const processBackendResult = (result) => {
    if (!result.cues) return;

    // The backend returns probabilities. If they are null, we are still baselining.
    // However, to make the prototype visually interesting immediately, if the backend 
    // is in baselining mode, we can inject some fake probabilities for the chart AFTER 5 seconds, 
    // or just strictly follow the status. Let's strictly follow the backend rules, 
    // but the backend was modified to return mock data if mediapipe failed. 

    // Update status
    const newStatus = result.cues.gaze_horizontal_ratio?.status || 'monitoring';
    setEngineStatus(newStatus);

    // Format data for Recharts
    const newPoint = {
      time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
      // If probability is null (baselining), we plot exactly 0.5 (the baseline)
      gazeProbability: result.cues.gaze_horizontal_ratio?.probability ?? 0.5,
      pitchProbability: result.cues.head_pitch?.probability ?? 0.5,
      postureProbability: result.cues.shoulder_asymmetry?.probability ?? 0.5,
    };

    setTelemetryData(prev => {
      const updated = [...prev, newPoint];
      // Keep only last 20 points for visual clarity
      if (updated.length > 20) return updated.slice(updated.length - 20);
      return updated;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="app-container">
      <Navigation 
        sessionActive={sessionActive} 
        onToggleSession={handleToggleSession} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      <main className="main-content">
        {currentView === 'compliance' ? (
          <ComplianceDashboard />
        ) : (
          <>
            <section style={styles.hero}>
          <h1 style={styles.heroTitle}>
            CONDUCT ETHICAL<br />
            INTERVIEWS WITH<br />
            PROBABILISTIC AI.
          </h1>
          <div style={styles.heroSubtitleContainer}>
            <div style={styles.heroSubtitle}>
              <div style={styles.smileIcon}>=)</div>
              <p style={styles.subtitleText}>
                SANKET guarantees compliance with Indian evidentiary law by 
                forbidding deterministic "lie detection" outputs.
              </p>
            </div>
          </div>
        </section>

        {sessionEnded ? (
          <PostSessionSummary telemetryData={telemetryData} onReset={resetToHome} />
        ) : (
          <>
            <section style={styles.grid}>
              {/* Left Column: Video Feed & Transcript */}
              <div style={styles.leftColumn}>
                <div className="card" style={styles.videoCard}>
                  <div style={styles.videoHeader}>
              <span style={{ fontWeight: '600', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Live Feed (Subject A)</span>
              {sessionActive && <span style={styles.recordingDot}></span>}
            </div>
            
            <div style={styles.videoWrapper}>
              {!sessionActive && (
                <div style={styles.videoPlaceholder}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Click "Start Session" to connect camera and begin telemetry.</p>
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ ...styles.video, display: sessionActive ? 'block' : 'none' }} 
              />
              {/* Hidden canvas for extracting frames */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </div>
                </div>
                <LiveTranscript sessionActive={sessionActive} liveLines={liveLines} />
              </div>

              {/* Right Column: Telemetry */}
          <div style={styles.telemetryWrapper}>
            <TelemetryCharts data={telemetryData} status={engineStatus} />
          </div>
        </section>

        {/* Real-time Interpretation Panel */}
        <section>
          <InsightsPanel 
            latestData={telemetryData.length > 0 ? telemetryData[telemetryData.length - 1] : null} 
            isBaselining={engineStatus === 'baselining'} 
          />
        </section>
        </>
        )}
      </>
      )}
      </main>
    </div>
  );
}

const styles = {
  hero: {
    marginBottom: '4rem',
    position: 'relative',
  },
  heroTitle: {
    fontSize: '5.5rem',
    fontWeight: '700',
    letterSpacing: '-0.04em',
    lineHeight: '1.0',
    color: 'var(--text-primary)',
    marginBottom: '4rem',
  },
  heroSubtitleContainer: {
    borderTop: '1px solid var(--border-light)',
    paddingTop: '2rem',
    width: '100%',
  },
  heroSubtitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    maxWidth: '600px',
  },
  smileIcon: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    transform: 'rotate(90deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--text-primary)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    flexShrink: 0,
    paddingBottom: '2px'
  },
  subtitleText: {
    margin: 0,
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
    fontWeight: '400',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '2rem',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  videoCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  videoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  recordingDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid var(--border-light)',
  },
  videoPlaceholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    padding: '2rem',
    textAlign: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror webcam
  },
  telemetryWrapper: {
    height: '100%',
  }
};

export default App;
