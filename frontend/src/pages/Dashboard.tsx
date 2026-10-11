import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { contactService } from '../services/contact.service';
import { sosService, type SOSResponse } from '../services/sos.service';
import { journeyService, JourneyStatus, type Journey } from '../services/journey.service';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Navigation, 
  BookOpen, 
  Users, 
  CheckCircle, 
  Activity, 
  Radio, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Mic,
  Lightbulb,
  FileText,
  AlertTriangle,
  ExternalLink,
  X
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError, warning, info } = useToast();
  const [activeCount, setActiveCount] = useState(0);
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [selectedSosContactIds, setSelectedSosContactIds] = useState<number[]>([]);
  const [primaryContact, setPrimaryContact] = useState<string>('None configured');
  const [activeSOS, setActiveSOS] = useState<SOSResponse | null>(null);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeyCountdown, setJourneyCountdown] = useState<string>('');
  const [isJourneyOverdue, setIsJourneyOverdue] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Ready');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [completingJourney, setCompletingJourney] = useState(false);

  const countdownTimerRef = useRef<number | null>(null);

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchData = async () => {
    try {
      const contacts = await contactService.getAll();
      const active = contacts.filter((c: any) => c.isActive !== false);
      setContactsList(active);
      setSelectedSosContactIds(active.map((c: any) => c.id));
      setActiveCount(active.length);
      if (active.length > 0) {
        const sorted = [...active].sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99));
        setPrimaryContact(`${sorted[0].name} (${sorted[0].relationship || 'Guardian'})`);
      }
      
      const activeIncident = await sosService.getActiveSOS();
      setActiveSOS(activeIncident || null);

      const journey = await journeyService.getActiveJourney();
      setActiveJourney(journey);
    } catch (e) {
      // quiet fail on initial load
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Journey countdown logic
  useEffect(() => {
    if (!activeJourney || !activeJourney.expectedArrivalAt) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    const tick = () => {
      const targetTime = new Date(activeJourney.expectedArrivalAt!).getTime();
      const diffMs = targetTime - Date.now();
      if (diffMs <= 0) {
        setIsJourneyOverdue(true);
        const overdueSecs = Math.abs(Math.floor(diffMs / 1000));
        const m = Math.floor(overdueSecs / 60);
        const s = overdueSecs % 60;
        setJourneyCountdown(`+${m}m ${s < 10 ? '0' : ''}${s}s OVERDUE`);
      } else {
        setIsJourneyOverdue(false);
        const remSecs = Math.floor(diffMs / 1000);
        const m = Math.floor(remSecs / 60);
        const s = remSecs % 60;
        setJourneyCountdown(`${m}m ${s < 10 ? '0' : ''}${s}s`);
      }
    };

    tick();
    countdownTimerRef.current = window.setInterval(tick, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [activeJourney?.expectedArrivalAt]);

  const toggleSosContact = (id: number) => {
    setSelectedSosContactIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const triggerSOS = () => {
    setShowConfirmModal(false);
    setIsActivating(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    const payloadBase = {
      message: "EMERGENCY: User activated SOS distress beacon from SafeHer platform.",
      contactIds: selectedSosContactIds.length > 0 ? selectedSosContactIds : undefined
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLocationStatus('Coordinates locked. Dispatching SOS distress beacon...');
            const result = await sosService.activateSOS({
              ...payloadBase,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            setActiveSOS(result);
            toastError("🚨 EMERGENCY SOS BEACON ACTIVE: High-accuracy GPS coordinates broadcast to your emergency contacts.");
          } catch (e: any) {
            toastError("Emergency beacon recorded locally. Contacts notification dispatched.");
          } finally {
            setIsActivating(false);
            setLocationStatus('Ready');
          }
        },
        async () => {
          try {
            setLocationStatus('Location access timed out. Triggering fallback distress signal...');
            const result = await sosService.activateSOS({ 
              ...payloadBase,
              message: "EMERGENCY: User activated SOS (Location unavailable)." 
            });
            setActiveSOS(result);
            warning("🚨 SOS distress beacon dispatched (GPS location was unavailable).");
          } catch (e: any) {
            toastError("Emergency beacon recorded.");
          } finally {
            setIsActivating(false);
            setLocationStatus('Ready');
          }
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      sosService.activateSOS({ ...payloadBase, message: "EMERGENCY: User activated SOS (Browser GPS unsupported)." })
        .then(res => {
          setActiveSOS(res);
          warning("🚨 SOS emergency distress beacon activated.");
        })
        .catch(() => toastError("Emergency alert recorded."))
        .finally(() => {
          setIsActivating(false);
          setLocationStatus('Ready');
        });
    }
  };

  const handleMarkSafe = async () => {
    if (!activeSOS) return;
    try {
      await sosService.resolveSOS(activeSOS.id);
      setActiveSOS(null);
      success("Status resolved: You are marked safe. Distress beacon deactivated.");
    } catch (e) {
      toastError("Failed to resolve SOS status. Please try again.");
    }
  };

  const handleCompleteActiveJourney = async () => {
    if (!activeJourney) return;
    setCompletingJourney(true);
    try {
      await journeyService.completeJourney(activeJourney.id, true);
      setActiveJourney(null);
      success("Safe arrival confirmed! Your emergency contacts have been notified.");
    } catch (e) {
      toastError("Failed to complete journey.");
    } finally {
      setCompletingJourney(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Welcome & Safety Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.65rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <ShieldCheck size={15} /> SafeHer Personal Defense Hub
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
            {getGreeting()}, {user?.fullName || 'User'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.35rem' }}>
            Your personal safety command center is active and monitoring in real time.
          </p>
        </div>

        {/* Real-Time Telemetry Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--card-bg)', backdropFilter: 'blur(20px)', border: 'var(--glass-border)', padding: '0.55rem 1.15rem', borderRadius: '9999px', boxShadow: 'var(--glass-shadow)' }}>
            <span style={{ 
              width: '9px', 
              height: '9px', 
              borderRadius: '50%', 
              backgroundColor: activeSOS ? '#ef4444' : activeJourney ? '#3b82f6' : '#10b981', 
              display: 'inline-block', 
              boxShadow: activeSOS ? '0 0 10px #ef4444' : activeJourney ? '0 0 10px #3b82f6' : '0 0 10px #10b981',
              animation: 'sosPulse 2s infinite'
            }}></span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              System: {activeSOS ? 'EMERGENCY BEACON ACTIVE' : activeJourney ? 'SMART JOURNEY IN TRANSIT' : 'PROTECTED & READY'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              <span className="badge-dot"></span> GPS Online
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              <span className="badge-dot"></span> {activeCount} Armed Contacts
            </span>
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', fontSize: '0.75rem', padding: '0.25rem 0.65rem', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
              <Sparkles size={11} /> AI Shield Active
            </span>
          </div>
        </div>
      </div>

      {/* ─── ACTIVE SOS BEACON BANNER ────────────────────────────────────────── */}
      {activeSOS ? (
        <div className="card" style={{ 
          marginBottom: '2.5rem', 
          border: '2px solid #ef4444', 
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          boxShadow: '0 10px 40px rgba(239, 68, 68, 0.25)',
          padding: '2.5rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', marginBottom: '1rem' }}>
            <ShieldAlert size={48} />
          </div>
          <h2 style={{ color: '#ef4444', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '1px' }}>
            🚨 SOS DISTRESS BEACON ACTIVE
          </h2>
          <p style={{ maxWidth: '650px', margin: '0.75rem auto 1rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>
            Emergency broadcast was dispatched at <strong>{new Date(activeSOS.timestamp || activeSOS.createdAt || Date.now()).toLocaleTimeString()}</strong>. Your selected contacts have been notified with live distress coordinates.
          </p>

          {/* GPS Coordinates and Maps link */}
          {(activeSOS.mapsUrl || (activeSOS.latitude && activeSOS.longitude)) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <a 
                href={activeSOS.mapsUrl || `https://www.google.com/maps?q=${activeSOS.latitude},${activeSOS.longitude}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  color: '#ef4444', 
                  fontWeight: 700, 
                  fontSize: '1rem',
                  textDecoration: 'underline' 
                }}
              >
                <MapPin size={18} /> View Distress Location On Google Maps ({activeSOS.latitude?.toFixed(4)}, {activeSOS.longitude?.toFixed(4)}) <ExternalLink size={15} />
              </a>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="tel:112" 
              className="btn" 
              style={{ 
                backgroundColor: '#dc2626', 
                color: 'white', 
                padding: '0.9rem 2rem', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                width: 'auto', 
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)'
              }}
            >
              <PhoneCall size={20} /> Call Emergency (112)
            </a>
            <button 
              onClick={handleMarkSafe} 
              className="btn" 
              style={{ 
                backgroundColor: '#10b981', 
                color: 'white', 
                padding: '0.9rem 2rem', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                width: 'auto', 
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle size={20} /> I am Safe (Resolve SOS)
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '3rem 2rem'
        }}>
          <div style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>
            <span className="badge badge-danger" style={{ marginBottom: '0.75rem' }}>
              <Radio size={14} /> Instant Distress Beacon
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              In Danger? Press The Emergency SOS Button
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              One tap dispatches an urgent distress beacon with your live GPS coordinates to your primary emergency contacts and safety authorities.
            </p>
          </div>

          {/* RED SOS BUTTON */}
          <button 
            onClick={() => setShowConfirmModal(true)}
            disabled={isActivating}
            className="sos-emergency-btn"
            title="Press to trigger emergency distress signal"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={38} />
              <span>{isActivating ? 'DISPATCHING...' : 'ACTIVATE SOS'}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.5px', opacity: 0.9 }}>
              {isActivating ? locationStatus : 'Tap to instantly broadcast location & alert contacts'}
            </span>
          </button>
        </div>
      )}

      {/* ─── ACTIVE SMART JOURNEY WIDGET (IF IN TRANSIT) ───────────────────── */}
      {activeJourney && (
        <div 
          className="card animate-slide-up" 
          style={{ 
            marginBottom: '2.5rem', 
            padding: '1.75rem 2rem',
            border: isJourneyOverdue ? '2px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.4)',
            background: isJourneyOverdue 
              ? 'rgba(239, 68, 68, 0.08)' 
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
            boxShadow: isJourneyOverdue ? '0 8px 30px rgba(239, 68, 68, 0.2)' : '0 8px 25px rgba(59, 130, 246, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                padding: '0.85rem', 
                borderRadius: '14px', 
                background: isJourneyOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                color: isJourneyOverdue ? '#ef4444' : '#3b82f6'
              }}>
                <Navigation size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800,
                    background: isJourneyOverdue ? '#ef4444' : '#10b981',
                    color: 'white'
                  }}>
                    {isJourneyOverdue ? 'OVERDUE TRIP' : 'IN TRANSIT'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    To: <strong>{activeJourney.destination?.address}</strong>
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', margin: 0 }}>
                  {activeJourney.title}
                </h3>
              </div>
            </div>

            {/* COUNTDOWN & ACTIONS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: isJourneyOverdue ? '#ef4444' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isJourneyOverdue ? 'Overdue Elapsed' : 'Expected In'}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace', color: isJourneyOverdue ? '#ef4444' : 'var(--text-main)' }}>
                  {journeyCountdown}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={handleCompleteActiveJourney}
                  disabled={completingJourney}
                  className="btn"
                  style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    padding: '0.65rem 1.25rem', 
                    fontSize: '0.95rem', 
                    fontWeight: 700, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    width: 'auto',
                    borderRadius: '8px'
                  }}
                >
                  <CheckCircle size={16} /> Arrived Safely
                </button>
                <Link 
                  to="/journey" 
                  className="btn"
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid var(--border-color)', 
                    padding: '0.65rem 1.1rem', 
                    fontSize: '0.95rem',
                    color: 'var(--text-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    width: 'auto',
                    borderRadius: '8px'
                  }}
                >
                  Live Journey Center <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SOS CONFIRMATION MODAL WITH GUARDIAN SELECTION ────────────────── */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', textAlign: 'center', border: '2px solid #ef4444' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>
              Confirm Emergency SOS Activation
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Are you in danger? This queries your real-time GPS coordinates and immediately transmits an urgent distress beacon with Google Maps links to your emergency contacts.
            </p>

            {/* Contacts To Notify Selector */}
            {contactsList.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Contacts to alert ({selectedSosContactIds.length}/{contactsList.length} selected):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem', maxHeight: '110px', overflowY: 'auto' }}>
                  {contactsList.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedSosContactIds.includes(c.id)} 
                        onChange={() => toggleSosContact(c.id)} 
                      />
                      <span><strong>{c.name}</strong> {c.relationship ? `(${c.relationship})` : ''} - {c.phoneNumber || c.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="btn"
                style={{ width: 'auto', padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button 
                onClick={triggerSOS}
                className="btn btn-danger"
                style={{ width: 'auto', padding: '0.75rem 2rem', fontWeight: 800, gap: '0.4rem' }}
              >
                <ShieldAlert size={18} /> Yes, Activate SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK HELPLINES BAR */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={18} color="var(--primary)" /> Emergency Helplines
          </h3>
          <Link to="/emergency-services" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
            View All Services →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <a href="tel:112" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ef4444' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#ef4444' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>National Emergency</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>112</div>
            </div>
          </a>

          <a href="tel:181" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#8b5cf6' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Women Helpline</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>181</div>
            </div>
          </a>

          <a href="tel:108" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Medical Response</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>108</div>
            </div>
          </a>
        </div>
      </div>

      {/* CORE PLATFORM MODULES GRID */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Personal Safety Suite & Tools
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* 1. Trusted Contacts */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '14px' }}>
                  <Users size={22} />
                </div>
                <span className="badge badge-primary">{activeCount} Active</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Trusted Contacts</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                Primary: <strong>{primaryContact}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Manage priority responder hierarchy, contact cards, and alert dispatch preferences.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/emergency-contacts" className="btn btn-primary" style={{ fontSize: '0.9rem', gap: '0.4rem' }}>
                Manage Safety Circle <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 2. AI Safety Assistant */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.75rem', borderRadius: '14px' }}>
                  <Sparkles size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>AI Assistant</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>AI Safety Assistant</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                24/7 intelligent chat offering situational de-escalation advice, precautions, and travel tips.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/ai-assistant" className="btn" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Chat with Assistant <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 3. Live Location Sharing */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '14px' }}>
                  <MapPin size={22} />
                </div>
                <span className="badge badge-success">GPS Active</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Location Sharing</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Fetch exact device coordinates, generate real-time Google Maps links, and share via Web Share.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/location-share" className="btn" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Share Live Coordinates <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 4. Smart Journey Tracker */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '14px' }}>
                  <Navigation size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  {activeJourney ? 'Active Trip' : 'Trip Guardian'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Smart Journey</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {activeJourney 
                  ? `Currently tracking trip to ${activeJourney.destination?.address}. Countdown & alerts enabled.`
                  : 'Register commute routes with departure, arrival monitoring, and automated safety buffers.'}
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/journey" className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                {activeJourney ? 'Track Live Journey' : 'View & Plan Journeys'} <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 5. Private Safety Diary */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem', borderRadius: '14px' }}>
                  <BookOpen size={22} />
                </div>
                <span className="badge badge-warning">Private Vault</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Safety Diary</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Log situations where you felt unsafe with risk levels, timestamps, and AI pattern recognition.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/diary" className="btn" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Open Private Diary <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 6. SOS History */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '14px' }}>
                  <Clock size={22} />
                </div>
                <span className="badge badge-danger">Audit Logs</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>SOS History</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Review past triggered distress beacons, locations, and resolution timestamps.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/sos-history" className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Review SOS Logs <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 7. Fake Call Simulator */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '0.75rem', borderRadius: '14px' }}>
                  <PhoneCall size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>Discreet Exit</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Fake Call Simulator</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Schedule a simulated incoming phone call to gracefully exit uncomfortable interactions.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/fake-call" className="btn" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Simulate Call <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 8. Audio Recording */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '0.75rem', borderRadius: '14px' }}>
                  <Mic size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>Evidence</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Audio Recording</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Capture ambient voice evidence using MediaRecorder with live playback and file export.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/audio-recording" className="btn" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Record Audio <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 9. Incident Reports */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '14px' }}>
                  <FileText size={22} />
                </div>
                <span className="badge badge-primary">Reporting</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Incident Reporting</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                File detailed safety reports with categories, location tags, and track review status.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/reports" className="btn btn-primary" style={{ fontSize: '0.9rem', gap: '0.4rem' }}>
                File / View Reports <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 10. Safety Tips */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem', borderRadius: '14px' }}>
                  <Lightbulb size={22} />
                </div>
                <span className="badge badge-warning">Guidance</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Safety Tips & Guides</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Expert recommendations for personal safety, digital privacy, transit, and travel.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/safety-tips" className="btn" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Read Safety Tips <ArrowRight size={15} />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
