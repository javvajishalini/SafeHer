import React from 'react';
import { JourneyStatus, type Journey } from '../../services/journey.service';
import { Clock, MapPin, Navigation, ShieldAlert, CheckCircle, ExternalLink, Users } from 'lucide-react';

interface JourneyListProps {
    journeys: Journey[];
    onEdit: (j: Journey) => void;
    onStart: (id: number) => void;
    onComplete: (id: number) => void;
    onCancel: (id: number) => void;
}

export const JourneyList: React.FC<JourneyListProps> = ({ journeys, onEdit, onStart, onComplete, onCancel }) => {
    
    const getStatusStyle = (status: JourneyStatus) => {
        switch (status) {
            case JourneyStatus.PLANNED:
                return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
            case JourneyStatus.ACTIVE:
                return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
            case JourneyStatus.OVERDUE:
                return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '1px solid #ef4444' };
            case JourneyStatus.COMPLETED:
                return { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case JourneyStatus.CANCELLED:
                return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
        }
    };

    if (journeys.length === 0) {
        return (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '12px', border: 'var(--glass-border)' }}>
                No journeys found in this category.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {journeys.map(j => {
                const statusStyle = getStatusStyle(j.status);
                const isOverdue = j.status === JourneyStatus.OVERDUE;
                const isActive = j.status === JourneyStatus.ACTIVE;

                return (
                    <div 
                        key={j.id} 
                        className="card animate-slide-up" 
                        style={{ 
                            padding: '1.75rem', 
                            border: isOverdue ? '2px solid #ef4444' : isActive ? '1px solid rgba(16, 185, 129, 0.4)' : undefined,
                            boxShadow: isOverdue ? '0 4px 20px rgba(239, 68, 68, 0.2)' : undefined
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                                        {j.title}
                                    </h4>
                                    {isOverdue && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <ShieldAlert size={16} /> OVERDUE ALERT TRIGGERED
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={14} /> {j.journeyDate} • Scheduled {j.plannedStartTime} - {j.expectedArrivalTime}
                                    {j.safetyBufferMinutes ? ` (+${j.safetyBufferMinutes}m buffer)` : ''}
                                </p>
                            </div>

                            <span style={{ 
                                padding: '0.35rem 0.85rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.85rem', 
                                fontWeight: 700,
                                background: statusStyle.bg,
                                color: statusStyle.text,
                                border: statusStyle.border,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                            }}>
                                {isOverdue && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />}
                                {j.status}
                            </span>
                        </div>
                        
                        {/* ROUTE INFO */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <MapPin size={18} color="var(--primary)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Start</span>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{j.startLocation?.address || 'Current Location'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <Navigation size={18} color="#10b981" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                                <div>
                                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Destination</span>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{j.destination?.address || 'Designated Stop'}</div>
                                </div>
                            </div>
                        </div>

                        {/* LIVE LOCATION AND CONTACTS SUMMARY */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {j.emergencyContacts && j.emergencyContacts.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <Users size={15} color="var(--primary)" />
                                    <span>Guardians: {j.emergencyContacts.map(c => c.name).join(', ')}</span>
                                </div>
                            )}

                            {j.lastLocationUrl && (
                                <a 
                                    href={j.lastLocationUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    <ExternalLink size={14} /> View Last Tracked GPS on Google Maps
                                </a>
                            )}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {j.status === JourneyStatus.PLANNED && (
                                <>
                                    <button 
                                        onClick={() => onStart(j.id)} 
                                        className="btn btn-primary" 
                                        style={{ padding: '0.6rem 1.25rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                                    >
                                        <Navigation size={16} /> Start Journey Now
                                    </button>
                                    <button 
                                        onClick={() => onEdit(j)} 
                                        className="btn" 
                                        style={{ padding: '0.6rem 1rem', width: 'auto', background: 'transparent', border: '1px solid var(--border-color)' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => onCancel(j.id)} 
                                        className="btn" 
                                        style={{ padding: '0.6rem 1rem', width: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}

                            {(isActive || isOverdue) && (
                                <button 
                                    onClick={() => onComplete(j.id)} 
                                    className="btn" 
                                    style={{ 
                                        padding: '0.6rem 1.4rem', 
                                        width: 'auto', 
                                        background: '#10b981', 
                                        color: 'white', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '0.4rem', 
                                        fontWeight: 700,
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <CheckCircle size={18} /> I Have Arrived Safely (Complete)
                                </button>
                            )}

                            {(isActive || isOverdue) && (
                                <button 
                                    onClick={() => onCancel(j.id)} 
                                    className="btn" 
                                    style={{ padding: '0.6rem 1rem', width: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                >
                                    Cancel Journey
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
