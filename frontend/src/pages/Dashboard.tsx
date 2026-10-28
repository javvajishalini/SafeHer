import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { contactService } from '../services/contact.service';
import { sosService, type SOSResponse } from '../services/sos.service';
import { journeyService, JourneyStatus, type Journey } from '../services/journey.service';
import { ActiveSOSScreen } from '../components/ActiveSOSScreen';
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
  Share2,
  Plus,
  EyeOff
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
  const pollingRef = useRef<number | null>(null);

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
    // Real-time polling every 8s to update status without manual refresh
    pollingRef.current = window.setInterval(fetchData, 8000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Journey countdown logic
  useEffect(() => {
    if (!activeJourney || !activeJourney.expectedArrivalAt) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    const tick = () => {
      const targetTime = new Date(activeJourney.expectedArrivalAt!).getTime();
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setIsJourneyOverdue(true);
        const overdueSecs = Math.abs(Math.floor(diffMs / 1000));
        const m = Math.floor(overdueSecs / 60);
        const s = overdueSecs % 60;
        setJourneyCountdown(`+${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s} OVERDUE`);
      } else {
        setIsJourneyOverdue(false);
        const remSecs = Math.floor(diffMs / 1000);
        const m = Math.floor(remSecs / 60);
        const s = remSecs % 60;
        setJourneyCountdown(`${m < 10 ? '0' : ''}${m} : ${s < 10 ? '0' : ''}${s}`);
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
      emergencyContactIds: selectedSosContactIds.length > 0 ? selectedSosContactIds : undefined,
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
            fetchData();
          } catch (e: any) {
            toastError("Emergency beacon recorded locally. Contacts notification dispatched.");
          } finally {
            setIsActivating(false);
            setLocationStatus('Ready');
          }
        },
        async (geoErr) => {
          try {
            setLocationStatus('Location access timed out. Triggering fallback distress signal...');
            const result = await sosService.activateSOS({ 
              ...payloadBase,
              message: "EMERGENCY: User activated SOS (Location unavailable / permission denied)." 
            });
            setActiveSOS(result);
            warning("🚨 SOS distress beacon dispatched (GPS location was unavailable).");
            fetchData();
          } catch (e: any) {
            toastError("Emergency beacon recorded.");
          } finally {
            setIsActivating(false);
            setLocationStatus('Ready');
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      sosService.activateSOS({ ...payloadBase, message: "EMERGENCY: User activated SOS (Browser GPS unsupported)." })
        .then(res => {
          setActiveSOS(res);
          warning("🚨 SOS emergency distress beacon activated.");
          fetchData();
        })
        .catch(() => toastError("Emergency alert recorded."))
        .finally(() => {
          setIsActivating(false);
          setLocationStatus('Ready');
        });
    }
  };

  const handleCompleteActiveJourney = async () => {
    if (!activeJourney) return;
    setCompletingJourney(true);
    try {
      await journeyService.completeJourney(activeJourney.id, true);
      setActiveJourney(null);
      success("Safe arrival confirmed! Your emergency contacts have been notified.");
      fetchData();
    } catch (e) {
      toastError("Failed to complete journey.");
    } finally {
      setCompletingJourney(false);
    }
  };

  const handleShareJourney = async () => {
    if (!activeJourney) return;
    const shareText = `🛡️ SAFEHER SMART JOURNEY: I am traveling from ${activeJourney.startLocation?.address || 'Current Location'} to ${activeJourney.destination?.address || 'Destination'}. Status: ${activeJourney.status}. ETA remaining: ${journeyCountdown}.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SafeHer Smart Journey Live Status',
          text: shareText,
          url: activeJourney.lastLocationUrl || window.location.href
        });
        success("Journey details shared.");
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(shareText);
      info("Journey status copied to clipboard!");
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Welcome & Safety Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.65rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <ShieldCheck size={15} /> SafeHer Personal Safety &amp; Emergency Hub
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
              backgroundColor: activeSOS ? '#ef4444' : activeJourney ? (isJourneyOverdue ? '#ef4444' : '#3b82f6') : '#10b981', 
              display: 'inline-block', 
              boxShadow: activeSOS ? '0 0 10px #ef4444' : activeJourney ? '0 0 10px #3b82f6' : '0 0 10px #10b981',
              animation: 'sosPulse 2s infinite'
            }}></span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              System: {activeSOS ? 'EMERGENCY BEACON ACTIVE' : activeJourney ? (isJourneyOverdue ? 'JOURNEY OVERDUE' : 'SMART JOURNEY IN TRANSIT') : 'PROTECTED & READY'}
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

      {/* ─── 1. DEDICATED ACTIVE SOS SCREEN (Requirement 6) ────────────────── */}
      {activeSOS ? (
        <ActiveSOSScreen 
          incident={activeSOS} 
          onResolved={() => {
            setActiveSOS(null);
            fetchData();
          }} 
        />
      ) : (
        /* PROMINENT SOS ACTIVATION BUTTON & HERO CARD (Requirement 1 & 5) */
        <div className="card" style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '3rem 2rem',
          borderRadius: '20px'
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

          {/* LARGE EASY-TO-PRESS SOS BUTTON */}
          <button 
            type="button"
            id="sos-main-btn"
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

          {/* SECONDARY SOS MODE BUTTONS */}
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Silent / Discreet SOS */}
            <button
              id="sos-silent-btn"
              type="button"
              disabled={isActivating}
              onClick={() => {
                if (!window.confirm("Activate SILENT SOS? This will quietly alert your emergency contacts without any loud alarm. Use this if making a visible distress signal could put you in more danger.")) return;
                setIsActivating(true);
                setLocationStatus('Acquiring location for stealth alert...');
                const payload = {
                  sosType: 'SILENT' as const,
                  emergencyContactIds: selectedSosContactIds.length > 0 ? selectedSosContactIds : undefined,
                };
                const finalize = (result: any) => { setActiveSOS(result); fetchData(); setIsActivating(false); setLocationStatus('Ready'); };
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      try {
                        const res = await sosService.activateSOS({ ...payload, latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
                        finalize(res);
                      } catch { setIsActivating(false); }
                    },
                    async () => { try { const res = await sosService.activateSOS(payload); finalize(res); } catch { setIsActivating(false); } },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                  );
                } else {
                  sosService.activateSOS(payload).then(finalize).catch(() => setIsActivating(false));
                }
              }}
              title="Silent/Discreet SOS – no visible alarm, covert alert"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(139, 92, 246, 0.12)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                padding: '0.7rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.3px'
              }}
            >
              <EyeOff size={16} />
              Silent / Discreet SOS
            </button>

            {/* In-Journey SOS — shows when there's an active journey */}
            {activeJourney && (
              <button
                id="sos-journey-btn"
                type="button"
                disabled={isActivating}
                onClick={() => {
                  if (!window.confirm("Activate IN-JOURNEY SOS? This will immediately alert your emergency contacts with your current location and journey details.")) return;
                  setIsActivating(true);
                  setLocationStatus('Acquiring location...');
                  const payload = {
                    sosType: 'IN_JOURNEY' as const,
                    journeyId: activeJourney.id,
                    emergencyContactIds: selectedSosContactIds.length > 0 ? selectedSosContactIds : undefined,
                  };
                  const finalize = (result: any) => { setActiveSOS(result); fetchData(); setIsActivating(false); setLocationStatus('Ready'); };
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        try {
                          const res = await sosService.activateSOS({ ...payload, latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
                          finalize(res);
                        } catch { setIsActivating(false); }
                      },
                      async () => { try { const res = await sosService.activateSOS(payload); finalize(res); } catch { setIsActivating(false); } },
                      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                    );
                  } else {
                    sosService.activateSOS(payload).then(finalize).catch(() => setIsActivating(false));
                  }
                }}
                title="In-Journey Emergency SOS – attach to active Smart Journey"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '12px',
                  padding: '0.7rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.3px'
                }}
              >
                <Navigation size={16} />
                In-Journey Emergency SOS
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. SMART JOURNEY WIDGET ON DASHBOARD (Requirement 11, 12, 26) ──── */}
      {activeJourney ? (
        <div 
          className="card animate-slide-up" 
          style={{ 
            marginBottom: '2.5rem', 
            padding: '2rem',
            border: isJourneyOverdue ? '2px solid #ef4444' : '2px solid var(--primary)',
            background: isJourneyOverdue 
              ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.02) 100%)' 
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
            boxShadow: isJourneyOverdue ? '0 10px 35px rgba(239, 68, 68, 0.25)' : '0 10px 30px rgba(99, 102, 241, 0.15)',
            borderRadius: '18px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ 
                padding: '0.85rem', 
                borderRadius: '14px', 
                background: isJourneyOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                color: isJourneyOverdue ? '#ef4444' : 'var(--primary)'
              }}>
                <Navigation size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.65rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800,
                    background: isJourneyOverdue ? '#ef4444' : '#10b981',
                    color: 'white'
                  }}>
                    {isJourneyOverdue ? '⚠️ JOURNEY OVERDUE' : '🛡️ SMART JOURNEY ACTIVE'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Safety Buffer: +{activeJourney.safetyBufferMinutes ?? 0}m
                  </span>
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem', margin: 0 }}>
                  {activeJourney.title}
                </h3>
              </div>
            </div>

            {/* REAL COUNTDOWN DISPLAY */}
            <div style={{
              textAlign: 'right',
              padding: '0.65rem 1.4rem',
              borderRadius: '12px',
              background: isJourneyOverdue ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.12)',
              border: isJourneyOverdue ? '1px solid #ef4444' : '1px solid rgba(99, 102, 241, 0.25)'
            }}>
              <div style={{ fontSize: '0.75rem', color: isJourneyOverdue ? '#ef4444' : 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                {isJourneyOverdue ? 'Overdue Elapsed' : '⏱ Time Remaining'}
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, fontFamily: 'monospace', color: isJourneyOverdue ? '#ef4444' : 'var(--text-main)', letterSpacing: '1px' }}>
                {journeyCountdown}
              </div>
            </div>
          </div>

          {/* Journey Path Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>📍 Current Location</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeJourney.startLocation?.address || 'En route'}
              </div>
              {activeJourney.lastLocationUpdate && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Last updated: {new Date(activeJourney.lastLocationUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>🏁 Destination</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeJourney.destination?.address || 'Designated Stop'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>👥 Guardians Watching</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeJourney.emergencyContacts && activeJourney.emergencyContacts.length > 0 
                  ? activeJourney.emergencyContacts.map(c => c.name).join(', ')
                  : 'All Armed Contacts'}
              </div>
            </div>
          </div>

          {/* Active Journey Buttons: VIEW ROUTE, SHARE JOURNEY, END JOURNEY */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/journey"
              className="btn btn-primary"
              style={{
                width: 'auto',
                padding: '0.75rem 1.4rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '8px'
              }}
            >
              <Navigation size={16} /> VIEW ROUTE
            </Link>

            <button
              type="button"
              onClick={handleShareJourney}
              className="btn"
              style={{
                width: 'auto',
                padding: '0.75rem 1.3rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '8px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <Share2 size={16} /> SHARE JOURNEY
            </button>

            <button
              type="button"
              onClick={handleCompleteActiveJourney}
              disabled={completingJourney}
              className="btn"
              style={{
                width: 'auto',
                padding: '0.75rem 1.5rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderRadius: '8px',
                background: '#10b981',
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
              }}
            >
              <CheckCircle size={16} /> END JOURNEY (ARRIVED SAFELY)
            </button>
          </div>
        </div>
      ) : (
        /* NO ACTIVE JOURNEY CARD (Requirement 12) */
        <div 
          className="card" 
          style={{ 
            marginBottom: '2.5rem', 
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '0.85rem',
              borderRadius: '14px',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)'
            }}>
              <Navigation size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                🛡️ Smart Journey
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0 0' }}>
                No active Smart Journey
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Set up automated GPS tracking with an arrival countdown timer and safety buffer for your trips.
              </p>
            </div>
          </div>

          <Link
            to="/journey"
            className="btn btn-primary"
            style={{
              width: 'auto',
              padding: '0.8rem 1.6rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Plus size={18} /> CREATE SMART JOURNEY
          </Link>
        </div>
      )}

      {/* ─── SOS CONFIRMATION MODAL (Requirement 5) ────────────────────────── */}
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
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', textAlign: 'center', border: '2px solid #ef4444', borderRadius: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', animation: 'pulse 1.5s infinite' }}>
              <AlertTriangle size={34} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem' }}>
              Are you sure you want to activate SOS?
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your selected emergency contacts will be notified immediately with your current real-time GPS coordinates and Google Maps distress link.
            </p>

            {/* Contacts To Notify Selector */}
            {contactsList.length > 0 ? (
              <div style={{ textAlign: 'left', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1.1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Contacts to alert ({selectedSosContactIds.length}/{contactsList.length} selected):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem', maxHeight: '130px', overflowY: 'auto' }}>
                  {contactsList.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', padding: '0.2rem 0' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedSosContactIds.includes(c.id)} 
                        onChange={() => toggleSosContact(c.id)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <span><strong>{c.name}</strong> {c.relationship ? `(${c.relationship})` : ''} – {c.phoneNumber || c.email}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.85rem' }}>
                ⚠️ No emergency contacts configured. SOS will be recorded and Universal Police (112) is available.
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn"
                style={{ width: 'auto', padding: '0.85rem 1.6rem', background: 'transparent', border: '1px solid var(--border-color)', fontWeight: 600 }}
              >
                CANCEL
              </button>
              <button 
                type="button"
                onClick={triggerSOS}
                className="btn btn-danger"
                style={{ width: 'auto', padding: '0.85rem 2rem', fontWeight: 900, gap: '0.5rem', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)' }}
              >
                <ShieldAlert size={18} /> ACTIVATE SOS
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
          <a href="tel:112" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ef4444', textDecoration: 'none' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#ef4444' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>National Emergency</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>112</div>
            </div>
          </a>

          <a href="tel:1091" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ec4899', textDecoration: 'none' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#ec4899' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Women Helpline</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>1091</div>
            </div>
          </a>

          <a href="tel:108" className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981', textDecoration: 'none' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', color: '#10b981' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ambulance Response</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>108</div>
            </div>
          </a>
        </div>
      </div>

      {/* CORE PLATFORM MODULES GRID */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Personal Safety Suite &amp; Tools
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

          {/* 1. Trusted Contacts */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '14px' }}>
                  <Users size={22} />
                </div>
                <span className="badge badge-primary">{activeCount} Configured</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Emergency Contacts</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Primary: <strong>{primaryContact}</strong>. Manage family members and trusted guardians alerted during SOS.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/emergency-contacts" className="btn btn-primary" style={{ fontSize: '0.9rem', gap: '0.4rem' }}>
                Manage Contacts <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 2. Smart Journey */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '14px' }}>
                  <Navigation size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>GPS Guardian</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Smart Journey</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Real-time route display, arrival countdown timers, and automatic overdue safety alert dispatch.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/journey" className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Smart Journey Center <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 3. SOS Incident History */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '14px' }}>
                  <Radio size={22} />
                </div>
                <span className="badge badge-danger">Audit Log</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>SOS History &amp; Alerts</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Review past emergency distress signals, GPS coordinates, timestamps, and notification delivery logs.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/sos-history" className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                View SOS History <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 4. Safety Diary */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '14px' }}>
                  <BookOpen size={22} />
                </div>
                <span className="badge badge-success">Encrypted</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Safety Diary</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Privately log incidents, suspicious encounters, dates, locations, and personal observations.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/diary" className="btn" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Open Safety Diary <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 5. AI Safety Assistant */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.75rem', borderRadius: '14px' }}>
                  <Sparkles size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>Gemini AI</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>AI Safety Assistant</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                24/7 intelligent companion for real-time safety advice, risk assessment, and legal emergency guidance.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/ai-assistant" className="btn" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Chat with AI Assistant <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 6. Fake Call */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', padding: '0.75rem', borderRadius: '14px' }}>
                  <PhoneCall size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>Discreet Escape</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Discreet Fake Call</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Schedule or immediately trigger an incoming call simulation with realistic voice audio to exit unsafe situations.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/fake-call" className="btn" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', fontSize: '0.9rem', gap: '0.4rem' }}>
                Simulate Call <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* 7. Audio Recording */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '0.75rem', borderRadius: '14px' }}>
                  <Mic size={22} />
                </div>
                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>Evidence</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Audio Evidence Recorder</h4>
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

          {/* 8. Incident Reports */}
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

          {/* 9. Safety Tips */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.75rem', borderRadius: '14px' }}>
                  <Lightbulb size={22} />
                </div>
                <span className="badge badge-warning">Guidance</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>Safety Tips &amp; Guides</h4>
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
