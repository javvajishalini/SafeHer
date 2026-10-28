import React, { useEffect, useState } from 'react';
import { sosService, type SOSResponse } from '../services/sos.service';
import { notificationService, type NotificationRecord } from '../services/notification.service';
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
  MessageSquare,
  Mail,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  EyeOff,
  Navigation
} from 'lucide-react';

export const SOSHistory: React.FC = () => {
  const { success, error: toastError, warning } = useToast();
  const [incidents, setIncidents] = useState<SOSResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED' | 'CANCELLED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'STANDARD' | 'IN_JOURNEY' | 'SILENT' | 'OVERDUE'>('ALL');
  const [expandedNotifications, setExpandedNotifications] = useState<Record<number, NotificationRecord[]>>({});
  const [loadingNotifs, setLoadingNotifs] = useState<Record<number, boolean>>({});

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await sosService.getSOSHistory();
      setIncidents(data);
    } catch (err) {
      toastError('Failed to load emergency SOS history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleNotificationLogs = async (id: number) => {
    if (expandedNotifications[id]) {
      setExpandedNotifications(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    setLoadingNotifs(prev => ({ ...prev, [id]: true }));
    try {
      const logs = await notificationService.getSOSNotifications(id);
      setExpandedNotifications(prev => ({ ...prev, [id]: logs }));
    } catch (e) {
      // quiet fallback
    } finally {
      setLoadingNotifs(prev => ({ ...prev, [id]: false }));
    }
  };

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
    const statusMatch = filter === 'ALL' || inc.status === filter;
    const typeMatch = typeFilter === 'ALL' || (inc.sosType || 'STANDARD') === typeFilter;
    return statusMatch && typeMatch;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.65rem', borderRadius: '12px' }}>
              <ShieldAlert size={28} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Emergency SOS History
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Complete chronological audit log of all triggered distress beacons, GPS telemetry, and notification dispatches.
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.4rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            {(['ALL', 'ACTIVE', 'RESOLVED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className="btn"
                style={{
                  width: 'auto',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: filter === status ? 'var(--primary-gradient)' : 'transparent',
                  color: filter === status ? 'white' : 'var(--text-muted)',
                  borderRadius: '8px'
                }}
              >
                {status}
              </button>
            ))}
          </div>
          {/* SOS Type filter */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {([
              { value: 'ALL', label: 'All Types', color: 'var(--text-muted)' },
              { value: 'STANDARD', label: '🚨 One-Touch', color: '#ef4444' },
              { value: 'SILENT', label: '🤫 Silent', color: '#8b5cf6' },
              { value: 'IN_JOURNEY', label: '🚗 In-Journey', color: '#3b82f6' },
              { value: 'OVERDUE', label: '⏰ Overdue', color: '#f59e0b' },
            ] as const).map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                style={{
                  border: `1px solid ${typeFilter === value ? color : 'var(--border-color)'}`,
                  background: typeFilter === value ? `${color}22` : 'transparent',
                  color: typeFilter === value ? color : 'var(--text-muted)',
                  borderRadius: '8px',
                  padding: '0.28rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredIncidents.map((incident) => {
            const isActive = incident.status === 'ACTIVE';
            const isResolved = incident.status === 'RESOLVED';
            const hasLocation = incident.latitude !== undefined && incident.longitude !== undefined;
            const mapsUrl = hasLocation ? `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}` : undefined;
            const notifLogs = expandedNotifications[incident.id];
            const isExpanded = !!notifLogs;

            return (
              <div 
                key={incident.id} 
                className="card"
                style={{ 
                  border: isActive ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(239, 68, 68, 0.04)' : undefined,
                  boxShadow: isActive ? '0 8px 30px rgba(239, 68, 68, 0.15)' : '0 4px 15px rgba(0,0,0,0.04)',
                  padding: '1.75rem',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${isActive ? 'badge-danger' : (isResolved ? 'badge-success' : 'badge-warning')}`} style={{ fontWeight: 800 }}>
                      {isActive ? <Radio size={14} className="animate-pulse" /> : (isResolved ? <CheckCircle size={14} /> : <XCircle size={14} />)}
                      {incident.status}
                    </span>
                    {/* SOS Type Badge */}
                    {(() => {
                      const typeMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
                        STANDARD: { label: 'ONE-TOUCH', color: '#ef4444', icon: <ShieldAlert size={12} /> },
                        IN_JOURNEY: { label: 'IN-JOURNEY', color: '#3b82f6', icon: <Navigation size={12} /> },
                        SILENT: { label: 'SILENT', color: '#8b5cf6', icon: <EyeOff size={12} /> },
                        OVERDUE: { label: 'OVERDUE', color: '#f59e0b', icon: <Clock size={12} /> },
                      };
                      const t = typeMap[incident.sosType || 'STANDARD'];
                      return (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          background: `${t.color}18`, color: t.color,
                          border: `1px solid ${t.color}44`,
                          borderRadius: '9999px', padding: '0.18rem 0.6rem',
                          fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em'
                        }}>
                          {t.icon} {t.label}
                        </span>
                      );
                    })()}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Incident #{incident.id}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <Clock size={16} />
                    <span>{new Date(incident.timestamp || incident.createdAt || Date.now()).toLocaleString()}</span>
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
                    background: 'var(--bg-secondary)', 
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
                        padding: '0.4rem 0.95rem', 
                        fontSize: '0.85rem', 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        color: 'var(--primary)',
                        gap: '0.35rem',
                        fontWeight: 700
                      }}
                    >
                      <ExternalLink size={14} /> View in Google Maps
                    </a>
                  </div>
                )}

                {/* Notification Delivery Audit Dropdown */}
                <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => toggleNotificationLogs(incident.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: 0
                    }}
                  >
                    <MessageSquare size={14} />
                    {isExpanded ? 'Hide Delivery Status Logs' : 'View Notification Delivery Logs'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                      {notifLogs.length === 0 ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No notification records stored for this incident.</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {notifLogs.map(n => {
                            const isSent = n.status === 'SENT' || n.status === 'DELIVERED';
                            return (
                              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: 'var(--card-bg)', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  {n.type === 'EMAIL' ? <Mail size={14} color="var(--primary)" /> : <PhoneCall size={14} color="#10b981" />}
                                  <span>{n.type} to {n.recipient} ({n.provider || 'Provider'})</span>
                                </div>
                                <span style={{
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '9999px',
                                  fontWeight: 700,
                                  background: isSent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: isSent ? '#10b981' : '#ef4444'
                                }}>
                                  {n.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Active Incident Actions */}
                {isActive && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleResolve(incident.id)}
                      className="btn"
                      style={{ width: 'auto', background: '#10b981', color: 'white', padding: '0.65rem 1.4rem', fontSize: '0.9rem', gap: '0.4rem', fontWeight: 800 }}
                    >
                      <CheckCircle size={16} /> Mark Resolved (I am Safe)
                    </button>
                    <button 
                      onClick={() => handleCancel(incident.id)}
                      className="btn"
                      style={{ width: 'auto', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
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
