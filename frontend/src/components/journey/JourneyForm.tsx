import React, { useState } from 'react';
import { CreateJourneyRequest } from '../../services/journey.service';

interface JourneyFormProps {
    initialData?: CreateJourneyRequest;
    onSubmit: (data: CreateJourneyRequest) => void;
    onCancel: () => void;
    loading: boolean;
}

export const JourneyForm: React.FC<JourneyFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState<CreateJourneyRequest>(initialData || {
        title: '',
        startLocation: { address: '' },
        destination: { address: '' },
        journeyDate: '',
        plannedStartTime: '',
        expectedArrivalTime: '',
        description: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'startAddress') {
            setFormData({ ...formData, startLocation: { address: value } });
        } else if (name === 'destAddress') {
            setFormData({ ...formData, destination: { address: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (formData.plannedStartTime && formData.expectedArrivalTime) {
            if (formData.expectedArrivalTime <= formData.plannedStartTime) {
                setError('Expected arrival time must be after planned start time');
                return;
            }
        }
        
        // ensure time has seconds format HH:mm:ss for backend compatibility (if they enter HH:mm)
        const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t;
        
        onSubmit({
            ...formData,
            plannedStartTime: formatTime(formData.plannedStartTime),
            expectedArrivalTime: formatTime(formData.expectedArrivalTime)
        });
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>{initialData ? 'Edit Journey' : 'Register New Journey'}</h3>
            {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Journey Title *</label>
                    <input type="text" name="title" required className="input-field" value={formData.title} onChange={handleChange} placeholder="e.g. Commute to Work" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">Starting Location *</label>
                        <input type="text" name="startAddress" required className="input-field" value={formData.startLocation.address} onChange={handleChange} placeholder="Enter address" />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Destination *</label>
                        <input type="text" name="destAddress" required className="input-field" value={formData.destination.address} onChange={handleChange} placeholder="Enter address" />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Journey Date *</label>
                    <input type="date" name="journeyDate" required className="input-field" value={formData.journeyDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">Planned Start Time *</label>
                        <input type="time" name="plannedStartTime" required className="input-field" value={formData.plannedStartTime.substring(0,5)} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Expected Arrival Time *</label>
                        <input type="time" name="expectedArrivalTime" required className="input-field" value={formData.expectedArrivalTime.substring(0,5)} onChange={handleChange} />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Description (Optional)</label>
                    <textarea name="description" className="input-field" value={formData.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} placeholder="Any extra details about this journey"></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={onCancel} className="btn" style={{ background: '#E5E7EB', color: 'var(--text-main)' }}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Register Journey'}</button>
                </div>
            </form>
        </div>
    );
};
