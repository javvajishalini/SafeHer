import React, { useEffect, useState } from 'react';
import { sosService, type SOSResponse } from '../services/sos.service';
import { useToast } from '../context/ToastContext';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Filter,
  Radio,
  AlertOctagon
} from 'lucide-react';

export const SOSHistory: React.FC = () => {
  const { success, error: toastError, warning } = useToast();
  const [incidents, setIncidents] = useState<SOSResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'>('ALL');
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await sosService.getSOSHistory();
      setIncidents(data);
    } catch (err) {
      setError('Failed to load emergency SOS history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await sosService.resolveSOS(id);
      success(`SOS incident #${id} marked as resolved. You are safe.`);
      fetchHistory();
    } catch (e) {
      toastError("Failed to resolve SOS incident.");
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this SOS incident?")) return;
    try {
      await sosService.cancelSOS(id);
      warning(`SOS incident #${id} cancelled.`);
      fetchHistory();
    } catch (e) {
      toastError("Failed to cancel SOS incident.");
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'ALL') return true;
    return inc.status === filter;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.6rem', borderRadius: '12px' }}>
              <ShieldAlert size={26} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Emergency SOS History
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Complete chronological audit log of all triggered distress beacons and location dispatches.
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.35rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
          {(['ALL', 'ACTIVE', 'RESOLVED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="btn"
              style={{
                width: 'auto',
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                background: filter === status ? 'var(--primary-gradient)' : 'transparent',
                color: filter === status ? 'white' : 'var(--text-muted)',
                borderRadius: '8px'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>Loading SOS records...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '1rem' }}>
            <CheckCircle size={40} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>No SOS Incidents Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {filter === 'ALL' ? 'You have not activated any emergency distress beacons.' : `No incidents with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredIncidents.map((incident) => {
            const isActive = incident.status === 'ACTIVE';
            const isResolved = incident.status === 'RESOLVED';
            const hasLocation = incident.latitude !== undefined && incident.longitude !== undefined;
            const mapsUrl = hasLocation ? `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}` : undefined;

            return (
              <div 
                key={incident.id} 
                className="card"
                style={{ 
                  border: isActive ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(239, 68, 68, 0.05)' : undefined,
                  padding: '1.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge ${isActive ? 'badge-danger' : (isResolved ? 'badge-success' : 'badge-warning')}`}>
                      {isActive ? <Radio size={14} className="animate-pulse" /> : (isResolved ? <CheckCircle size={14} /> : <XCircle size={14} />)}
                      {incident.status}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Incident ID: #{incident.id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <Clock size={16} />
                    <span>{new Date(incident.timestamp || incident.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
                  {incident.message || 'Distress signal dispatched.'}
                </p>

                {/* Location Box */}
                {hasLocation && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: '0.75rem',
                    padding: '0.85rem 1rem', 
                    background: 'rgba(0,0,0,0.03)', 
                    borderRadius: '12px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <MapPin size={18} color="var(--primary)" />
                      <span>
                        <strong>GPS:</strong> {incident.latitude?.toFixed(6)}, {incident.longitude?.toFixed(6)}
                        {incident.accuracy && ` (±${Math.round(incident.accuracy)}m accuracy)`}
                      </span>
                    </div>

                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ 
                        width: 'auto', 
                        padding: '0.35rem 0.85rem', 
                        fontSize: '0.85rem', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: 'var(--primary)',
                        gap: '0.35rem' 
                      }}
                    >
                      <ExternalLink size={14} /> View in Google Maps
                    </a>
                  </div>
                )}

                {/* Active Incident Actions */}
                {isActive && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleResolve(incident.id)}
                      className="btn"
                      style={{ width: 'auto', background: '#10b981', color: 'white', padding: '0.6rem 1.25rem', fontSize: '0.9rem', gap: '0.4rem' }}
                    >
                      <CheckCircle size={16} /> Mark Resolved (I am Safe)
                    </button>
                    <button 
                      onClick={() => handleCancel(incident.id)}
                      className="btn"
                      style={{ width: 'auto', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                    >
                      Cancel Incident
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
