import React, { useEffect, useState, useRef } from 'react';
import { journeyService, JourneyStatus, type Journey, type CreateJourneyRequest } from '../services/journey.service';
import { sosService } from '../services/sos.service';
import { useToast } from '../context/ToastContext';
import { JourneyList } from '../components/journey/JourneyList';
import { JourneyForm } from '../components/journey/JourneyForm';
import { LiveJourneyMap } from '../components/LiveJourneyMap';
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle, 
  Navigation, 
  MapPin, 
  Users, 
  ExternalLink, 
  AlertTriangle,
  Compass,
  Activity,
  Plus,
  Share2,
  Radio,
  Eye,
  ShieldCheck,
  XCircle
} from 'lucide-react';

export const JourneyPage: React.FC = () => {
  const { success, error: toastError, warning, info } = useToast();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Live tracking state
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [countdownText, setCountdownText] = useState<string>('--:--');
  const [isOverdueState, setIsOverdueState] = useState<boolean>(false);
  const [trackingStatus, setTrackingStatus] = useState<string>('GPS standby');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentGpsCoords, setCurrentGpsCoords] = useState<[number, number] | null>(null);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [sendSafeArrivalNotice, setSendSafeArrivalNotice] = useState(true);

  const trackingIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const pollActiveIntervalRef = useRef<number | null>(null);

  const loadJourneys = async () => {
    setLoading(true);
    try {
      const data = await journeyService.getJourneys();
      setJourneys(data);

      const active = data.find(j => j.status === JourneyStatus.ACTIVE || j.status === JourneyStatus.OVERDUE);
      setActiveJourney(active || null);
    } catch (e) {
      console.error("Failed to load journeys", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJourneys();
    // Poll backend active journey periodically (every 10s) to catch backend @Scheduled overdue transitions
    pollActiveIntervalRef.current = window.setInterval(async () => {
      try {
        const active = await journeyService.getActiveJourney();
        if (active) {
          setActiveJourney(active);
          if (active.status === JourneyStatus.OVERDUE) {
            setIsOverdueState(true);
          }
        }
      } catch (err) {}
    }, 10000);

    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (pollActiveIntervalRef.current) clearInterval(pollActiveIntervalRef.current);
    };
  }, []);

  // ─── REAL-TIME GPS TRACKING & OVERDUE COUNTDOWN ───────────────────────────
  useEffect(() => {
    if (!activeJourney) {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    // 1. Live Countdown Loop (1-second tick)
    const updateCountdown = () => {
      if (!activeJourney.expectedArrivalAt) {
        setCountdownText('--:--');
        return;
      }

      const targetTime = new Date(activeJourney.expectedArrivalAt).getTime();
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setIsOverdueState(true);
        const overdueSeconds = Math.abs(Math.floor(diffMs / 1000));
        const mins = Math.floor(overdueSeconds / 60);
        const secs = overdueSeconds % 60;
        setCountdownText(`+${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs} OVERDUE`);
      } else {
        setIsOverdueState(false);
        const remainingSeconds = Math.floor(diffMs / 1000);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setCountdownText(`${mins < 10 ? '0' : ''}${mins} : ${secs < 10 ? '0' : ''}${secs}`);
      }
    };

    updateCountdown();
    countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);

    // 2. Periodic Live Location Dispatch (every 25 seconds)
    const sendLocationPing = () => {
      if (!navigator.geolocation) return;

      setTrackingStatus('Querying live GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentGpsCoords([lat, lng]);

          try {
            const updated = await journeyService.updateLocation(activeJourney.id, {
              latitude: lat,
              longitude: lng,
              accuracy: pos.coords.accuracy
            });
            setActiveJourney(updated);
            setTrackingStatus(`GPS synchronized at ${new Date().toLocaleTimeString()} (accuracy: ±${Math.round(pos.coords.accuracy)}m)`);
          } catch (err) {
            setTrackingStatus('Location broadcast failed temporarily.');
          }
        },
        (err) => {
          setTrackingStatus('GPS permission pending or weak satellite signal.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    };

    // Send immediately once, then interval
    sendLocationPing();
    trackingIntervalRef.current = window.setInterval(sendLocationPing, 25000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [activeJourney?.id, activeJourney?.expectedArrivalAt]);

  // ─── JOURNEY ACTIONS ──────────────────────────────────────────────────────

  const handleCreate = async (data: CreateJourneyRequest) => {
    setFormLoading(true);
    try {
      await journeyService.createJourney(data);
      success('Smart Journey registered successfully with safety monitoring!');
      setView('list');
      loadJourneys();
    } catch (e) {
      toastError("Failed to register journey. Please verify inputs.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: CreateJourneyRequest) => {
    if (!editingJourney) return;
    setFormLoading(true);
    try {
      await journeyService.updateJourney(editingJourney.id, data);
      success('Smart Journey details updated.');
      setEditingJourney(null);
      setView('list');
      loadJourneys();
    } catch (e) {
      toastError("Failed to update journey.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStart = async (id: number) => {
    setActionLoading(true);
    setTrackingStatus('Acquiring starting GPS coordinates...');

    const startWithCoords = async (coords?: { latitude?: number; longitude?: number }) => {
      try {
        const target = journeys.find(j => j.id === id);
        let durationMins = 30;
        if (target?.plannedStartTime && target?.expectedArrivalTime) {
          const [sh, sm] = target.plannedStartTime.split(':').map(Number);
          const [eh, em] = target.expectedArrivalTime.split(':').map(Number);
          const diff = (eh * 60 + em) - (sh * 60 + sm);
          if (diff > 0) durationMins = diff;
        }

        const started = await journeyService.startJourney(id, {
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          expectedDurationMinutes: durationMins
        });
        setActiveJourney(started);
        success(`Smart Journey started! Automated arrival countdown and GPS tracking active.`);
        loadJourneys();
      } catch (e) {
        toastError("Failed to start journey. Please try again.");
      } finally {
        setActionLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          startWithCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {
          warning("GPS permission unavailable. Starting journey with scheduled timings.");
          startWithCoords();
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      startWithCoords();
    }
  };

  const confirmArrival = async () => {
    if (!activeJourney) return;
    setActionLoading(true);
    try {
      await journeyService.completeJourney(activeJourney.id, sendSafeArrivalNotice);
      setActiveJourney(null);
      setShowArrivalModal(false);
      success("Safe arrival confirmed! Journey completed and guardians notified.");
      loadJourneys();
    } catch (e) {
      toastError("Failed to complete journey.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this journey? Location sharing will stop.')) {
      setActionLoading(true);
      try {
        await journeyService.cancelJourney(id);
        if (activeJourney?.id === id) setActiveJourney(null);
        warning('Journey cancelled.');
        loadJourneys();
      } catch (e) {
        toastError("Failed to cancel journey.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const triggerTransitSOS = async () => {
    if (!window.confirm("EMERGENCY: Do you want to trigger immediate SOS distress beacon for this active journey?")) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await sosService.activateSOS({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              message: `TRANSIT EMERGENCY: Distress triggered during journey "${activeJourney?.title}".`
            });
            toastError("🚨 TRANSIT SOS ACTIVATED: Emergency coordinates broadcast to contacts!");
          } catch (e) {
            toastError("Emergency distress signal recorded.");
          }
        },
        async () => {
          await sosService.activateSOS({
            message: `TRANSIT EMERGENCY: Distress triggered during journey "${activeJourney?.title}".`
          });
          warning("🚨 Transit distress signal dispatched (Location unavailable).");
        }
      );
    } else {
      await sosService.activateSOS({
        message: `TRANSIT EMERGENCY: Distress triggered during journey "${activeJourney?.title}".`
      });
      warning("🚨 Transit distress signal dispatched.");
    }
  };

  const openEditForm = (j: Journey) => {
    setEditingJourney(j);
    setView('edit');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <ShieldCheck size={14} /> Automated Travel Companion
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
            Smart Journey Safety
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Automated transit guardian with real-time GPS telemetry, arrival timers, and instant timeout alerts
          </p>
        </div>
        {view === 'list' && (
          <button 
            type="button"
            className="btn btn-primary" 
            style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem', fontWeight: 800, borderRadius: '12px' }} 
            onClick={() => setView('create')}
          >
            <Plus size={18} /> PLAN NEW SMART JOURNEY
          </button>
        )}
      </div>

      {/* ─── ACTIVE / OVERDUE JOURNEY LIVE COMMAND CARD (Requirements 10, 11, 16, 17) ─── */}
      {activeJourney && view === 'list' && (
        <div 
          className="card animate-slide-up" 
          style={{ 
            marginBottom: '2.5rem', 
            padding: '2.5rem 2rem',
            border: isOverdueState ? '2px solid #ef4444' : '2px solid var(--primary)',
            background: isOverdueState 
              ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.02) 100%)' 
              : 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            boxShadow: isOverdueState 
              ? '0 12px 50px rgba(239, 68, 68, 0.25)' 
              : '0 12px 40px rgba(99, 102, 241, 0.15)',
            borderRadius: '20px'
          }}
        >
          {/* Card Header & Countdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                padding: '0.9rem', 
                borderRadius: '50%', 
                background: isOverdueState ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                color: isOverdueState ? '#ef4444' : 'var(--primary)'
              }}>
                {isOverdueState ? <ShieldAlert size={34} /> : <Navigation size={34} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 900, 
                    background: isOverdueState ? '#ef4444' : '#10b981', 
                    color: 'white',
                    letterSpacing: '0.05em'
                  }}>
                    {isOverdueState ? '⚠️ CRITICAL: OVERDUE' : '🟢 LIVE JOURNEY ACTIVE'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {activeJourney.journeyDate}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem', margin: 0 }}>
                  {activeJourney.title}
                </h2>
              </div>
            </div>

            {/* LIVE COUNTDOWN DISPLAY */}
            <div style={{ 
              textAlign: 'right', 
              padding: '0.85rem 1.75rem', 
              borderRadius: '14px', 
              background: isOverdueState ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.12)',
              border: isOverdueState ? '1px solid #ef4444' : '1px solid rgba(99, 102, 241, 0.25)'
            }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, color: isOverdueState ? '#ef4444' : 'var(--primary)' }}>
                {isOverdueState ? 'Overdue Elapsed' : 'Arrival Deadline In'}
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, fontFamily: 'monospace', color: isOverdueState ? '#ef4444' : 'var(--text-main)', letterSpacing: '1px' }}>
                {countdownText}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Buffer: +{activeJourney.safetyBufferMinutes ?? 0}m included
              </div>
            </div>
          </div>

          {/* OVERDUE CRITICAL BANNER (Requirement 14) */}
          {isOverdueState && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              borderLeft: '4px solid #ef4444', 
              padding: '1.1rem 1.25rem', 
              borderRadius: '10px', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <AlertTriangle size={28} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#ef4444', fontSize: '1rem' }}>Safety Timeout Alert Triggered: </strong>
                <span style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>
                  You have not confirmed arrival within the expected time window + safety buffer. An automatic emergency dispatch with your latest GPS coordinates has been delivered to your emergency contacts.
                </span>
              </div>
            </div>
          )}

          {/* LIVE TRANSPARENT LOCATION SHARING NOTICE (Requirement 16) */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Eye size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Smart Journey is <strong>actively sharing your real-time journey location</strong> with your selected emergency contacts.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCancel(activeJourney.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <XCircle size={15} /> STOP LOCATION SHARING
            </button>
          </div>

          {/* REAL ROUTE MAP DISPLAY (Requirement 10 & 17) */}
          <div style={{ marginBottom: '1.75rem' }}>
            <LiveJourneyMap
              startCoords={activeJourney.startLocation?.latitude && activeJourney.startLocation?.longitude ? [activeJourney.startLocation.latitude, activeJourney.startLocation.longitude] : undefined}
              destCoords={activeJourney.destination?.latitude && activeJourney.destination?.longitude ? [activeJourney.destination.latitude, activeJourney.destination.longitude] : undefined}
              currentCoords={currentGpsCoords || (activeJourney.lastLatitude && activeJourney.lastLongitude ? [activeJourney.lastLatitude, activeJourney.lastLongitude] : undefined)}
              startAddress={activeJourney.startLocation?.address}
              destAddress={activeJourney.destination?.address}
              height="340px"
            />
          </div>

          {/* ROUTE METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>START LOCATION</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeJourney.startLocation?.address}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>DESTINATION</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeJourney.destination?.address}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>GUARDIANS WATCHING</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeJourney.emergencyContacts && activeJourney.emergencyContacts.length > 0 
                  ? activeJourney.emergencyContacts.map(c => c.name).join(', ')
                  : 'All Active Contacts'}
              </div>
            </div>
          </div>

          {/* TELEMETRY STATUS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Activity size={16} color="#10b981" />
              <span>Telemetry: <strong>{trackingStatus}</strong></span>
            </div>

            {activeJourney.lastLocationUrl && (
              <a 
                href={activeJourney.lastLocationUrl} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
              >
                <ExternalLink size={15} /> Open Live GPS in Google Maps
              </a>
            )}
          </div>

          {/* ACTION CONTROLS */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              type="button"
              onClick={() => setShowArrivalModal(true)}
              disabled={actionLoading}
              className="btn" 
              style={{ 
                background: '#10b981', 
                color: 'white', 
                padding: '0.9rem 1.85rem', 
                fontSize: '1.05rem', 
                fontWeight: 800, 
                width: 'auto', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
              }}
            >
              <CheckCircle size={20} /> I Have Arrived Safely
            </button>

            <button 
              type="button"
              onClick={triggerTransitSOS}
              disabled={actionLoading}
              className="btn btn-danger" 
              style={{ 
                padding: '0.9rem 1.6rem', 
                fontSize: '1rem', 
                fontWeight: 800, 
                width: 'auto', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
            >
              <ShieldAlert size={18} /> Emergency / SOS Distress
            </button>

            <button 
              type="button"
              onClick={() => handleCancel(activeJourney.id)}
              disabled={actionLoading}
              className="btn" 
              style={{ 
                padding: '0.9rem 1.4rem', 
                width: 'auto', 
                background: 'transparent', 
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '12px',
                fontWeight: 600
              }}
            >
              Cancel Journey
            </button>
          </div>
        </div>
      )}

      {/* ─── SAFE ARRIVAL CONFIRMATION MODAL (Requirement 19) ──────────────── */}
      {showArrivalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="card animate-slide-up" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            borderRadius: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Have you reached your destination?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Confirming arrival stops active tracking and concludes your safety timer.
            </p>

            {/* Safe-arrival notification toggle (Requirement 19) */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              justifyContent: 'center',
              marginBottom: '1.75rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              background: 'var(--bg-secondary)',
              padding: '0.75rem 1rem',
              borderRadius: '10px'
            }}>
              <input
                type="checkbox"
                checked={sendSafeArrivalNotice}
                onChange={(e) => setSendSafeArrivalNotice(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>Send safe-arrival confirmation notification to contacts</span>
            </label>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowArrivalModal(false)}
                className="btn"
                style={{ width: 'auto', padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', fontWeight: 600 }}
              >
                NOT YET
              </button>
              <button
                type="button"
                onClick={confirmArrival}
                disabled={actionLoading}
                className="btn"
                style={{
                  width: 'auto',
                  padding: '0.8rem 2rem',
                  background: '#10b981',
                  color: 'white',
                  fontWeight: 800,
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                YES, I ARRIVED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
        <JourneyForm 
          onSubmit={handleCreate} 
          onCancel={() => setView('list')} 
          loading={formLoading} 
        />
      )}

      {/* EDIT VIEW */}
      {view === 'edit' && editingJourney && (
        <JourneyForm 
          initialData={{
            title: editingJourney.title,
            startLocation: editingJourney.startLocation,
            destination: editingJourney.destination,
            journeyDate: editingJourney.journeyDate,
            plannedStartTime: editingJourney.plannedStartTime,
            expectedArrivalTime: editingJourney.expectedArrivalTime,
            description: editingJourney.description,
            safetyBufferMinutes: editingJourney.safetyBufferMinutes,
            emergencyContactIds: editingJourney.emergencyContacts?.map(c => c.id)
          }}
          onSubmit={handleUpdate} 
          onCancel={() => { setView('list'); setEditingJourney(null); }} 
          loading={formLoading} 
        />
      )}

      {/* LIST VIEW (Requirement 21) */}
      {view === 'list' && (
        <div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading smart journeys...</p>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Clock size={20} color="var(--primary)" /> Smart Journey History &amp; Schedules ({journeys.length})
                </h3>
              </div>
              <JourneyList 
                journeys={journeys} 
                onEdit={openEditForm} 
                onStart={handleStart} 
                onComplete={(id) => {
                  setActiveJourney(journeys.find(j => j.id === id) || null);
                  setShowArrivalModal(true);
                }} 
                onCancel={handleCancel} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
