import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  ShieldAlert, 
  Volume2, 
  Clock,
  AlertCircle
} from 'lucide-react';

interface AudioRecordItem {
  id: string;
  url: string;
  blob: Blob;
  duration: number;
  createdAt: string;
}

export const AudioRecording: React.FC = () => {
  const { success, error: toastError, info, warning } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<AudioRecordItem[]>([]);
  const [error, setError] = useState('');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Microphone recording is not supported in your browser.';
      setError(msg);
      toastError(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newRecord: AudioRecordItem = {
          id: Date.now().toString(),
          url: audioUrl,
          blob: audioBlob,
          duration: recordingDuration,
          createdAt: new Date().toLocaleString()
        };
        setRecordings(prev => [newRecord, ...prev]);
        setRecordingDuration(0);
        success("Audio recording finished and saved to evidence vault.");

        // Stop media stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      info("Microphone recording active. Capturing evidence audio...");

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        const msg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        setError(msg);
        toastError(msg);
      } else {
        const msg = 'Failed to access microphone: ' + err.message;
        setError(msg);
        toastError(msg);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleDelete = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    info("Audio recording deleted.");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '0.6rem', borderRadius: '12px' }}>
            <Mic size={26} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Audio Evidence Recording
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
          Capture high-fidelity ambient voice evidence securely with full user consent and immediate local download.
        </p>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.12)', 
          color: '#ef4444', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Recorder Controls Card */}
      <div className="card" style={{ 
        padding: '3rem 2rem', 
        textAlign: 'center', 
        border: isRecording ? '2px solid #ef4444' : '1px solid var(--border-color)',
        background: isRecording ? 'rgba(239, 68, 68, 0.05)' : undefined,
        marginBottom: '2.5rem'
      }}>
        {isRecording ? (
          <div>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: '#ef4444', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              animation: 'sosPulse 1.5s infinite'
            }}>
              <Mic size={36} />
            </div>

            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '0.5rem' }}>
              {formatTime(recordingDuration)}
            </div>

            <span className="badge badge-danger" style={{ marginBottom: '2rem' }}>
              ● RECORDING IN PROGRESS
            </span>

            <div>
              <button 
                onClick={stopRecording} 
                className="btn btn-danger" 
                style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', gap: '0.5rem', margin: '0 auto' }}
              >
                <Square size={20} /> Stop & Save Recording
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Volume2 size={34} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Start Emergency Audio Capture
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
              Requires one-time microphone access. Recordings are saved locally in your browser and can be exported as `.webm` files.
            </p>

            <button 
              onClick={startRecording} 
              className="btn btn-primary" 
              style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', gap: '0.5rem', margin: '0 auto' }}
            >
              <Mic size={20} /> Start Audio Recording
            </button>
          </div>
        )}
      </div>

      {/* Captured Audio Recordings List */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Saved Recordings ({recordings.length})
        </h3>

        {recordings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No audio recordings captured in this session yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recordings.map((rec) => (
              <div key={rec.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    Recording #{rec.id.slice(-4)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {rec.createdAt}
                  </div>
                </div>

                {/* In-Browser HTML5 Audio Player */}
                <div style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}>
                  <audio controls src={rec.url} style={{ width: '100%', height: '40px' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a 
                    href={rec.url} 
                    download={`SafeHer-Audio-${rec.id}.webm`}
                    className="btn" 
                    style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.85rem', gap: '0.35rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
                    title="Download audio recording"
                  >
                    <Download size={16} /> Export
                  </a>

                  <button 
                    onClick={() => handleDelete(rec.id)} 
                    className="btn" 
                    style={{ width: 'auto', padding: '0.5rem 0.85rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    title="Delete recording"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
