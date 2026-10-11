import React, { useEffect, useState, useRef } from 'react';
import { journeyService, JourneyStatus, type Journey, type CreateJourneyRequest } from '../services/journey.service';
import { sosService } from '../services/sos.service';
import { useToast } from '../context/ToastContext';
import { JourneyList } from '../components/journey/JourneyList';
import { JourneyForm } from '../components/journey/JourneyForm';
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
    Plus
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

    const trackingIntervalRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);

    const loadJourneys = async () => {
        setLoading(true);
        try {
            const data = await journeyService.getJourneys();
            setJourneys(data);

            // Check if there is an active or overdue journey
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
        return () => {
            if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []);

    // ─── REAL-TIME GPS TRACKING & OVERDUE COUNTDOWN ───────────────────────────
    useEffect(() => {
        if (!activeJourney) {
            if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return;
        }

        // 1. Live Countdown Loop
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
                setCountdownText(`+${mins}m ${secs < 10 ? '0' : ''}${secs}s OVERDUE`);
            } else {
                setIsOverdueState(false);
                const remainingSeconds = Math.floor(diffMs / 1000);
                const mins = Math.floor(remainingSeconds / 60);
                const secs = remainingSeconds % 60;
                setCountdownText(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
            }
        };

        updateCountdown();
        countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);

        // 2. Periodic Live Location Dispatch (every 30 seconds)
        const sendLocationPing = () => {
            if (!navigator.geolocation) return;

            setTrackingStatus('Querying live GPS coordinates...');
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        const updated = await journeyService.updateLocation(activeJourney.id, {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy
                        });
                        setActiveJourney(updated);
                        setTrackingStatus(`GPS synchronized at ${new Date().toLocaleTimeString()} (accuracy: ±${Math.round(pos.coords.accuracy)}m)`);
                    } catch (err) {
                        setTrackingStatus('Location broadcast failed temporarily.');
                    }
                },
                (err) => {
                    setTrackingStatus('GPS signal weak / permission pending.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
            );
        };

        // Send immediately once on mount, then interval
        sendLocationPing();
        trackingIntervalRef.current = window.setInterval(sendLocationPing, 30000);

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
                // Find matching journey to compute duration
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
                    warning("GPS permission unavailable. Starting journey with estimated schedule.");
                    startWithCoords(); // fallback without GPS
                },
                { enableHighAccuracy: true, timeout: 6000 }
            );
        } else {
            startWithCoords();
        }
    };

    const handleComplete = async (id: number) => {
        if (!window.confirm("Confirm safe arrival? This will notify your emergency guardians that you have safely arrived.")) return;
        
        setActionLoading(true);
        try {
            await journeyService.completeJourney(id, true);
            setActiveJourney(null);
            success("Safe arrival confirmed! Notifications dispatched to your guardians.");
            loadJourneys();
        } catch (e) {
            toastError("Failed to complete journey.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (window.confirm('Are you sure you want to cancel this journey?')) {
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

    const activeJourneys = journeys.filter(j => j.status === JourneyStatus.ACTIVE || j.status === JourneyStatus.OVERDUE);
    const upcomingJourneys = journeys.filter(j => j.status === JourneyStatus.PLANNED);
    const pastJourneys = journeys.filter(j => j.status === JourneyStatus.COMPLETED || j.status === JourneyStatus.CANCELLED);

    return (
        <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        Smart Journey Safety
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
                        Automated transit guardian with real-time GPS telemetry and overdue alert dispatch
                    </p>
                </div>
                {view === 'list' && (
                    <button 
                        className="btn btn-primary" 
                        style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.5rem', fontWeight: 700 }} 
                        onClick={() => setView('create')}
                    >
                        <Plus size={18} /> Plan New Smart Journey
                    </button>
                )}
            </div>

            {/* ACTIVE / OVERDUE JOURNEY COMMAND CARD */}
            {activeJourney && view === 'list' && (
                <div 
                    className="card animate-slide-up" 
                    style={{ 
                        marginBottom: '2.5rem', 
                        padding: '2rem',
                        border: isOverdueState ? '2px solid #ef4444' : '2px solid var(--primary)',
                        background: isOverdueState 
                            ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)' 
                            : 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        boxShadow: isOverdueState 
                            ? '0 10px 40px rgba(239, 68, 68, 0.25)' 
                            : '0 10px 30px rgba(99, 102, 241, 0.15)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                                padding: '0.75rem', 
                                borderRadius: '50%', 
                                background: isOverdueState ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                                color: isOverdueState ? '#ef4444' : 'var(--primary)'
                            }}>
                                {isOverdueState ? <ShieldAlert size={32} /> : <Navigation size={32} />}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ 
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '9999px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 800, 
                                        background: isOverdueState ? '#ef4444' : '#10b981', 
                                        color: 'white' 
                                    }}>
                                        {isOverdueState ? 'CRITICAL: OVERDUE' : 'LIVE TRACKING ACTIVE'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {activeJourney.journeyDate}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                                    {activeJourney.title}
                                </h2>
                            </div>
                        </div>

                        {/* LIVE COUNTDOWN DISPLAY */}
                        <div style={{ 
                            textAlign: 'right', 
                            padding: '0.75rem 1.5rem', 
                            borderRadius: '12px', 
                            background: isOverdueState ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                            border: isOverdueState ? '1px solid #ef4444' : '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: isOverdueState ? '#ef4444' : 'var(--primary)' }}>
                                {isOverdueState ? 'Overdue Elapsed' : 'Arrival Deadline In'}
                            </div>
                            <div style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: 'monospace', color: isOverdueState ? '#ef4444' : 'var(--text-main)', letterSpacing: '1px' }}>
                                {countdownText}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Buffer: {activeJourney.safetyBufferMinutes ?? 0}m included
                            </div>
                        </div>
                    </div>

                    {/* OVERDUE BANNER */}
                    {isOverdueState && (
                        <div style={{ 
                            background: 'rgba(239, 68, 68, 0.15)', 
                            borderLeft: '4px solid #ef4444', 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                            <div>
                                <strong style={{ color: '#ef4444' }}>Safety Alert Dispatched: </strong>
                                <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    You have exceeded your scheduled arrival window + buffer time. Automatic alert SMS/Emails containing your last GPS location were dispatched to your emergency contacts.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ROUTE METRICS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>START LOCATION</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeJourney.startLocation?.address}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DESTINATION</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{activeJourney.destination?.address}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>GUARDIANS WATCHING</span>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {activeJourney.emergencyContacts && activeJourney.emergencyContacts.length > 0 
                                    ? activeJourney.emergencyContacts.map(c => c.name).join(', ')
                                    : 'All Active Contacts'}
                            </div>
                        </div>
                    </div>

                    {/* TELEMETRY STATUS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
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
                                <ExternalLink size={15} /> Open Live Coordinates in Google Maps
                            </a>
                        )}
                    </div>

                    {/* ACTION CONTROLS */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button 
                            onClick={() => handleComplete(activeJourney.id)}
                            disabled={actionLoading}
                            className="btn" 
                            style={{ 
                                background: '#10b981', 
                                color: 'white', 
                                padding: '0.85rem 1.75rem', 
                                fontSize: '1.05rem', 
                                fontWeight: 800, 
                                width: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                borderRadius: '10px',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                            }}
                        >
                            <CheckCircle size={20} /> I Have Arrived Safely
                        </button>

                        <button 
                            onClick={triggerTransitSOS}
                            disabled={actionLoading}
                            className="btn btn-danger" 
                            style={{ 
                                padding: '0.85rem 1.5rem', 
                                fontSize: '1rem', 
                                fontWeight: 800, 
                                width: 'auto', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                borderRadius: '10px'
                            }}
                        >
                            <ShieldAlert size={18} /> Distress / SOS
                        </button>

                        <button 
                            onClick={() => handleCancel(activeJourney.id)}
                            disabled={actionLoading}
                            className="btn" 
                            style={{ 
                                padding: '0.85rem 1.25rem', 
                                width: 'auto', 
                                background: 'transparent', 
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Cancel Journey
                        </button>
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

            {/* LIST VIEW */}
            {view === 'list' && (
                <div>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading smart journeys...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            
                            {/* UPCOMING JOURNEYS */}
                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={18} color="var(--primary)" /> Scheduled & Upcoming Journeys ({upcomingJourneys.length})
                                    </h3>
                                </div>
                                <JourneyList 
                                    journeys={upcomingJourneys} 
                                    onEdit={openEditForm} 
                                    onStart={handleStart} 
                                    onComplete={handleComplete} 
                                    onCancel={handleCancel} 
                                />
                            </section>

                            {/* PAST JOURNEYS */}
                            {pastJourneys.length > 0 && (
                                <section>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        Journey History ({pastJourneys.length})
                                    </h3>
                                    <JourneyList 
                                        journeys={pastJourneys} 
                                        onEdit={openEditForm} 
                                        onStart={handleStart} 
                                        onComplete={handleComplete} 
                                        onCancel={handleCancel} 
                                    />
                                </section>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
