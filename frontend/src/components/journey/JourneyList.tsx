import React from 'react';
import { Journey, JourneyStatus } from '../../services/journey.service';

interface JourneyListProps {
    journeys: Journey[];
    onEdit: (j: Journey) => void;
    onStart: (id: string) => void;
    onComplete: (id: string) => void;
    onCancel: (id: string) => void;
}

export const JourneyList: React.FC<JourneyListProps> = ({ journeys, onEdit, onStart, onComplete, onCancel }) => {
    
    const getStatusColor = (status: JourneyStatus) => {
        switch (status) {
            case JourneyStatus.PLANNED: return { bg: '#DBEAFE', text: '#1D4ED8' }; // Blue
            case JourneyStatus.ACTIVE: return { bg: '#FEF3C7', text: '#B45309' }; // Yellow
            case JourneyStatus.COMPLETED: return { bg: '#D1FAE5', text: '#047857' }; // Green
            case JourneyStatus.CANCELLED: return { bg: '#FEE2E2', text: '#B91C1C' }; // Red
            default: return { bg: '#F3F4F6', text: '#374151' };
        }
    };

    if (journeys.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No journeys found.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {journeys.map(j => {
                const statusColors = getStatusColor(j.status);
                return (
                    <div key={j.id} className="card animate-slide-up" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{j.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{j.journeyDate} • {j.plannedStartTime} - {j.expectedArrivalTime}</p>
                            </div>
                            <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '9999px', 
                                fontSize: '0.85rem', 
                                fontWeight: 600,
                                background: statusColors.bg,
                                color: statusColors.text
                            }}>
                                {j.status}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                            <div><strong>From:</strong> {j.startLocation.address}</div>
                            <div><strong>To:</strong> {j.destination.address}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {j.status === JourneyStatus.PLANNED && (
                                <>
                                    <button onClick={() => onStart(j.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', width: 'auto' }}>Start Journey</button>
                                    <button onClick={() => onEdit(j)} className="btn" style={{ padding: '0.5rem 1rem', width: 'auto', background: '#F3F4F6' }}>Edit</button>
                                    <button onClick={() => onCancel(j.id)} className="btn" style={{ padding: '0.5rem 1rem', width: 'auto', background: '#FEE2E2', color: '#B91C1C' }}>Cancel</button>
                                </>
                            )}
                            {j.status === JourneyStatus.ACTIVE && (
                                <button onClick={() => onComplete(j.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', width: 'auto', background: 'var(--success)' }}>Complete Journey</button>
                            )}
                            <button className="btn" style={{ padding: '0.5rem 1rem', width: 'auto', background: 'transparent', border: '1px solid var(--border-color)' }}>View Details</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
