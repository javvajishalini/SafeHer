import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, User } from 'lucide-react';

export const FakeCall: React.FC = () => {
  const [caller, setCaller] = useState('Mom');
  const [customCaller, setCustomCaller] = useState('');
  const [delay, setDelay] = useState(0);
  const [status, setStatus] = useState<'idle' | 'scheduled' | 'ringing' | 'active'>('idle');
  const [callDuration, setCallDuration] = useState(0);

  const displayCaller = caller === 'Custom' ? customCaller : caller;

  useEffect(() => {
    let timer: any;
    if (status === 'scheduled') {
      timer = setTimeout(() => {
        setStatus('ringing');
      }, delay * 1000);
    }
    return () => clearTimeout(timer);
  }, [status, delay]);

  useEffect(() => {
    let interval: any;
    if (status === 'active') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleSchedule = () => {
    if (caller === 'Custom' && !customCaller) {
      alert('Please enter a custom caller name');
      return;
    }
    setStatus('scheduled');
  };

  const handleEndCall = () => {
    setStatus('idle');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (status === 'ringing' || status === 'active') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#111', color: 'white', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '4rem 2rem', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ width: '120px', height: '120px', backgroundColor: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <User size={64} color="#aaa" />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '300', marginBottom: '0.5rem' }}>{displayCaller}</h1>
          <p style={{ fontSize: '1.2rem', color: '#aaa' }}>
            {status === 'ringing' ? 'Incoming Call...' : formatTime(callDuration)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '3rem', marginBottom: '4rem' }}>
          {status === 'ringing' ? (
            <>
              <button onClick={handleEndCall} style={{ width: '80px', height: '80px', borderRadius: '50%', border: 'none', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', animation: 'pulse 2s infinite' }}>
                <PhoneOff size={36} />
              </button>
              <button onClick={() => setStatus('active')} style={{ width: '80px', height: '80px', borderRadius: '50%', border: 'none', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', animation: 'pulse 2s infinite' }}>
                <Phone size={36} />
              </button>
            </>
          ) : (
            <button onClick={handleEndCall} style={{ width: '80px', height: '80px', borderRadius: '50%', border: 'none', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <PhoneOff size={36} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Fake Call Simulator</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Schedule a simulated incoming call to help you gracefully exit uncomfortable situations. This is not a real cellular call.</p>
      
      {status === 'scheduled' ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>Call Scheduled!</h3>
          <p style={{ margin: '1rem 0' }}>Your phone will "ring" in {delay} seconds from {displayCaller}.</p>
          <button onClick={handleEndCall} className="btn" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Cancel</button>
        </div>
      ) : (
        <div className="card">
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Caller Name</label>
            <select className="form-control" value={caller} onChange={(e) => setCaller(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}>
              <option value="Mom">Mom</option>
              <option value="Dad">Dad</option>
              <option value="Friend">Friend</option>
              <option value="Police">Police</option>
              <option value="Custom">Custom...</option>
            </select>
          </div>

          {caller === 'Custom' && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Custom Name</label>
              <input type="text" className="form-control" value={customCaller} onChange={(e) => setCustomCaller(e.target.value)} placeholder="e.g. Boss" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Delay Time</label>
            <select className="form-control" value={delay} onChange={(e) => setDelay(Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}>
              <option value={0}>Immediately</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>

          <button onClick={handleSchedule} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Schedule Fake Call
          </button>
        </div>
      )}
    </div>
  );
};
