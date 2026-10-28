import React, { useEffect, useState } from 'react';
import { type SOSResponse, sosService } from '../services/sos.service';
import { notificationService, type NotificationRecord } from '../services/notification.service';
import { useToast } from '../context/ToastContext';
import { LiveJourneyMap } from './LiveJourneyMap';
import { 
  ShieldAlert, 
  PhoneCall, 
  Share2, 
  CheckCircle, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Mail,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  XCircle
} from 'lucide-react';

interface ActiveSOSScreenProps {
  incident: SOSResponse;
  onResolved: () => void;
}

export const ActiveSOSScreen: React.FC<ActiveSOSScreenProps> = ({ incident, onResolved }) => {
  const { success, error: toastError, info } = useToast();
  const [resolving, setResolving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notification delivery statuses for this specific SOS incident
  const loadDeliveryLogs = async () => {
    if (!incident.id) return;
    setLoadingNotifications(true);
    try {
      const logs = await notificationService.getSOSNotifications(incident.id);
      setNotifications(logs);
    } catch (e) {
      // quiet fallback
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadDeliveryLogs();
    const interval = setInterval(loadDeliveryLogs, 10000); // refresh logs every 10s
    return () => clearInterval(interval);
  }, [incident.id]);

  const handleResolve = async () => {
    if (!window.confirm("Are you sure you want to resolve and deactivate this SOS emergency distress beacon?")) return;
    setResolving(true);
    try {
      await sosService.resolveSOS(incident.id);
      success("SOS Emergency incident marked as RESOLVED. Safe status logged.");
      onResolved();
    } catch (e) {
      toastError("Failed to resolve SOS incident. Please try again.");
    } finally {
      setResolving(false);
    }
  };

  const handleShareLocation = async () => {
    const mapsUrl = incident.mapsUrl || `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
    const shareText = `🚨 SAFEHER EMERGENCY ALERT: I activated SOS. My current location: ${mapsUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 SAFEHER SOS EMERGENCY LOCATION',
          text: shareText,
          url: mapsUrl
        });
        success("Location shared via native device share.");
      } catch (err) {
        // User cancelled or fallback
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      info("Emergency distress link & location copied to clipboard!");
    }
  };

  const formattedTime = incident.timestamp 
    ? new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  const hasCoords = incident.latitude != null && incident.longitude != null;

  return (
    <div className="card animate-slide-up" style={{
      maxWidth: '900px',
      margin: '0 auto 2.5rem',
      padding: '2.5rem 2rem',
      border: '2px solid #ef4444',
      background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.02) 100%)',
      boxShadow: '0 12px 50px rgba(239, 68, 68, 0.25)',
      borderRadius: '20px'
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            animation: 'pulse 1.5s infinite'
          }}>
            <ShieldAlert size={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{
                background: incident.sosType === 'SILENT' ? '#8b5cf6' : '#ef4444',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                padding: '0.2rem 0.75rem',
                borderRadius: '9999px',
                textTransform: 'uppercase'
              }}>
                {incident.sosType === 'SILENT' && '🤫 SILENT SOS ACTIVE'}
                {incident.sosType === 'IN_JOURNEY' && '🚗 IN-JOURNEY SOS ACTIVE'}
                {incident.sosType === 'OVERDUE' && '⏰ OVERDUE SOS ALERT'}
                {(!incident.sosType || incident.sosType === 'STANDARD') && '🚨 ONE-TOUCH SOS ACTIVE'}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Incident #{incident.id}
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: incident.sosType === 'SILENT' ? '#8b5cf6' : '#ef4444', margin: '0.3rem 0 0' }}>
              {incident.sosType === 'SILENT' ? 'Stealth Emergency Beacon Active' : 'Emergency Distress Alert Active'}
            </h1>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {incident.sosType === 'SILENT' 
                ? 'Covert emergency signal dispatched quietly. Visual and audio alarms are silenced to protect your safety.'
                : 'Your selected emergency contacts have been notified with your current coordinates.'}
            </p>
          </div>
        </div>

        <div style={{
          textAlign: 'right',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Activated At</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'monospace' }}>
            {formattedTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>STATUS: ACTIVE</div>
        </div>
      </div>

      {/* ACTIVE JOURNEY ALERT CONTEXT */}
      {incident.activeJourney && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Clock size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>Smart Journey Active During Distress:</strong>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>
              Journey "<strong>{incident.activeJourney.title}</strong>" from {incident.activeJourney.startAddress || 'Start'} to <strong>{incident.activeJourney.destAddress || 'Destination'}</strong> was included in the family distress dispatch.
            </p>
          </div>
        </div>
      )}

      {/* LOCATION SECTION & MAP */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <MapPin size={18} color="#ef4444" /> Distress Location Coordinates
        </h3>

        {hasCoords ? (
          <div>
            <LiveJourneyMap 
              currentCoords={[incident.latitude!, incident.longitude!]}
              startAddress={incident.address || 'Distress Beacon Coordinates'}
              height="300px"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>LATITUDE</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{incident.latitude?.toFixed(6)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>LONGITUDE</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{incident.longitude?.toFixed(6)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ACCURACY</span>
                <div style={{ fontWeight: 700, color: '#10b981' }}>±{incident.accuracy ? Math.round(incident.accuracy) : 10} meters</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>MAP LINK</span>
                <div>
                  <a href={incident.mapsUrl || `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    Google Maps <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
            <AlertTriangle size={20} style={{ marginBottom: '0.4rem' }} />
            <div><strong>Location access unavailable:</strong> GPS permission was denied or timed out. Emergency notifications were dispatched to contacts with a distress notice.</div>
          </div>
        )}
      </div>

      {/* DYNAMIC EMERGENCY CALL ACTION BUTTONS (Requirement 6) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          Direct Emergency Dialing (Tap to Call)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          One-touch instant phone dialing directly connects you to your guardians and official police response.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {/* Universal Police Emergency 112 */}
          <a
            href="tel:112"
            className="btn"
            style={{
              background: '#b91c1c',
              color: '#ffffff',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(185, 28, 28, 0.3)'
            }}
          >
            <PhoneCall size={20} /> CALL 112 (POLICE)
          </a>

          {/* Women Helpline 1091 */}
          <a
            href="tel:1091"
            className="btn"
            style={{
              background: '#e11d48',
              color: '#ffffff',
              padding: '0.9rem 1.25rem',
              borderRadius: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <PhoneCall size={20} /> CALL 1091 (WOMEN HELPLINE)
          </a>

          {/* DYNAMIC CONTACT CALL BUTTONS (Mom, Dad, Brother, Sister, Friends) */}
          {incident.emergencyContacts && incident.emergencyContacts.length > 0 ? (
            incident.emergencyContacts.map((contact) => (
              <a
                key={contact.id}
                href={contact.phoneNumber ? `tel:${contact.phoneNumber}` : '#'}
                className="btn"
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
              >
                <PhoneCall size={18} /> CALL {contact.name.toUpperCase()} {contact.relationship ? `(${contact.relationship.toUpperCase()})` : ''}
              </a>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
              No custom family phone numbers configured. Call 112 for immediate police assistance.
            </div>
          )}
        </div>
      </div>

      {/* REAL NOTIFICATION DELIVERY LOGS (Requirement 4 & 28) */}
      <div style={{ marginBottom: '2.5rem', background: 'var(--bg-secondary)', borderRadius: '14px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={16} color="var(--primary)" /> Emergency Dispatch Status &amp; Delivery Audit
          </h4>
          <button 
            type="button" 
            onClick={loadDeliveryLogs} 
            disabled={loadingNotifications}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <RefreshCw size={12} className={loadingNotifications ? 'animate-spin' : ''} /> Refresh Status
          </button>
        </div>

        {notifications.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Querying message delivery responses from Twilio SMS and SMTP mail server...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.map((n) => {
              const isSent = n.status === 'SENT' || n.status === 'DELIVERED';
              return (
                <div key={n.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--card-bg)',
                  border: isSent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {n.type === 'EMAIL' ? <Mail size={16} color="var(--primary)" /> : <PhoneCall size={16} color="#10b981" />}
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{n.type} to {n.recipient}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({n.provider || 'Provider'})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isSent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: isSent ? '#10b981' : '#ef4444'
                    }}>
                      {n.status}
                    </span>
                    {n.errorMessage && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={n.errorMessage}>
                        {n.errorMessage}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS: SHARE LOCATION & RESOLVE SOS */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button
          type="button"
          onClick={handleShareLocation}
          className="btn"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '0.85rem 1.5rem',
            borderRadius: '10px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: 'auto'
          }}
        >
          <Share2 size={18} color="var(--primary)" /> Share Distress Location
        </button>

        <button
          type="button"
          onClick={handleResolve}
          disabled={resolving}
          className="btn"
          style={{
            background: '#10b981',
            color: '#ffffff',
            padding: '0.85rem 2rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            width: 'auto',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
          }}
        >
          <CheckCircle size={20} /> I Am Safe / Resolve SOS
        </button>
      </div>
    </div>
  );
};
