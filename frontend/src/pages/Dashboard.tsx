import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contact.service';
import { sosService } from '../services/sos.service';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [primaryContact, setPrimaryContact] = useState<string>('None');
  const [activeSOS, setActiveSOS] = useState<any>(null);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contacts = await contactService.getAll();
        const active = contacts.filter((c: any) => c.isActive);
        setActiveCount(active.length);
        if (active.length > 0) {
          const sorted = active.sort((a: any, b: any) => a.priority - b.priority);
          setPrimaryContact(`${sorted[0].relationship} (${sorted[0].name})`);
        }
        
        const activeIncident = await sosService.getActiveSOS();
        setActiveSOS(activeIncident || null);
      } catch (e) {
        // ignore errors on dashboard
      }
    };
    fetchData();
  }, []);

  const handleActivateSOS = () => {
    if (!window.confirm("Are you sure you want to activate SOS? This will alert your contacts.")) return;
    setIsActivating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await sosService.activateSOS({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              message: "EMERGENCY: User activated SOS."
            });
            setActiveSOS(result);
          } catch (e) {
            alert("Failed to activate SOS on server, but you are still in emergency mode.");
          } finally {
            setIsActivating(false);
          }
        },
        async (error) => {
          // Fallback if location denied
          try {
            const result = await sosService.activateSOS({ message: "EMERGENCY: User activated SOS (Location unavailable)." });
            setActiveSOS(result);
          } catch(e) { }
          setIsActivating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      // Browser doesn't support geolocation
      sosService.activateSOS({ message: "EMERGENCY: User activated SOS (Geolocation not supported)." })
        .then(res => setActiveSOS(res))
        .finally(() => setIsActivating(false));
    }
  };

  const handleMarkSafe = async () => {
    if (!activeSOS) return;
    try {
      await sosService.resolveSOS(activeSOS.id);
      setActiveSOS(null);
    } catch (e) {
      alert("Failed to resolve SOS status.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Welcome back, {user?.fullName}.</p>
      
      {activeSOS ? (
        <div className="card" style={{ marginTop: '2rem', border: '2px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <h2 style={{ color: 'var(--danger)', fontSize: '2rem', textAlign: 'center' }}>🚨 SOS ACTIVATED 🚨</h2>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem' }}>
            Emergency alerts have been triggered. Your location was recorded at {new Date(activeSOS.timestamp).toLocaleTimeString()}.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
             <a href="tel:112" className="btn" style={{ backgroundColor: '#1d4ed8', color: 'white', padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none', borderRadius: '8px' }}>Call 112 (Police)</a>
             <button onClick={handleMarkSafe} className="btn" style={{ backgroundColor: 'var(--success)', color: 'white', padding: '1rem 2rem', fontSize: '1.2rem' }}>I am Safe (Cancel SOS)</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleActivateSOS}
            disabled={isActivating}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '2rem',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold',
              borderRadius: '20px',
              border: 'none',
              cursor: isActivating ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.5)',
              transition: 'transform 0.2s',
              animation: 'pulse 2s infinite'
            }}
          >
            {isActivating ? 'ACTIVATING...' : 'ACTIVATE SOS'}
          </button>
        </div>
      )}

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <div className="card">
          <h3>Emergency Contacts</h3>
          <p>{activeCount} Active</p>
          <p><strong>Primary Contact:</strong> {primaryContact}</p>
          <a href="/emergency-contacts" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>Manage Contacts →</a>
        </div>
        <div className="card">
          <h3>Smart Journey</h3>
          <p>Register and track your trips.</p>
          <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}><strong style={{ color: 'var(--success)' }}>Active:</strong> View your active and upcoming journeys.</p>
          <a href="/journey" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Manage Journeys</a>
        </div>
        <div className="card">
          <h3>Safety Diary & AI</h3>
          <p>Log incidents privately and get AI-powered insights.</p>
          <a href="/diary" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: 'white', marginTop: '1rem' }}>Analyze My Diary</a>
        </div>
        <div className="card">
          <h3>Fake Call</h3>
          <p>Schedule a simulated incoming call.</p>
          <p style={{ marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Use this to gracefully exit uncomfortable situations.</p>
          <a href="/fake-call" className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: 'white' }}>Schedule Fake Call</a>
        </div>
      </div>
    </div>
  );
};

