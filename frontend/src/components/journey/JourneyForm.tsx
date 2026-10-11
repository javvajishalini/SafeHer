import React, { useEffect, useState } from 'react';
import type { CreateJourneyRequest } from '../../services/journey.service';
import { contactService } from '../../services/contact.service';
import { Clock, Shield, Users } from 'lucide-react';

interface JourneyFormProps {
    initialData?: CreateJourneyRequest;
    onSubmit: (data: CreateJourneyRequest) => void;
    onCancel: () => void;
    loading: boolean;
}

interface ContactOption {
    id: number;
    name: string;
    relationship?: string;
    phoneNumber?: string;
    isActive: boolean;
}

export const JourneyForm: React.FC<JourneyFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState<CreateJourneyRequest>(initialData || {
        title: '',
        startLocation: { address: '' },
        destination: { address: '' },
        journeyDate: new Date().toISOString().split('T')[0],
        plannedStartTime: '',
        expectedArrivalTime: '',
        description: '',
        safetyBufferMinutes: 10,
        emergencyContactIds: []
    });

    const [contacts, setContacts] = useState<ContactOption[]>([]);
    const [selectedContactIds, setSelectedContactIds] = useState<number[]>(initialData?.emergencyContactIds || []);
    const [error, setError] = useState('');

    useEffect(() => {
        contactService.getAll().then((data: ContactOption[]) => {
            const activeOnly = data.filter(c => c.isActive !== false);
            setContacts(activeOnly);
            // Default select all active contacts if initial data has none
            if (!initialData || !initialData.emergencyContactIds || initialData.emergencyContactIds.length === 0) {
                const ids = activeOnly.map(c => c.id);
                setSelectedContactIds(ids);
            }
        }).catch(() => {});
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'startAddress') {
            setFormData({ ...formData, startLocation: { address: value } });
        } else if (name === 'destAddress') {
            setFormData({ ...formData, destination: { address: value } });
        } else if (name === 'safetyBufferMinutes') {
            setFormData({ ...formData, safetyBufferMinutes: parseInt(value, 10) || 0 });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const toggleContact = (id: number) => {
        setSelectedContactIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const selectAllContacts = () => {
        setSelectedContactIds(contacts.map(c => c.id));
    };

    const deselectAllContacts = () => {
        setSelectedContactIds([]);
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
        
        // calculate duration in minutes if possible
        let expectedDurationMinutes = 30;
        if (formData.plannedStartTime && formData.expectedArrivalTime) {
            const [sh, sm] = formData.plannedStartTime.split(':').map(Number);
            const [eh, em] = formData.expectedArrivalTime.split(':').map(Number);
            const diff = (eh * 60 + em) - (sh * 60 + sm);
            if (diff > 0) expectedDurationMinutes = diff;
        }

        onSubmit({
            ...formData,
            plannedStartTime: formatTime(formData.plannedStartTime),
            expectedArrivalTime: formatTime(formData.expectedArrivalTime),
            emergencyContactIds: selectedContactIds,
            expectedDurationMinutes
        });
    };

    return (
        <div className="card animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                    <Shield size={24} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                        {initialData ? 'Edit Smart Journey' : 'Plan a Smart Journey'}
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Automated monitoring with live overdue detection and instant alerts
                    </p>
                </div>
            </div>

            {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Journey Title *</label>
                    <input 
                        type="text" 
                        name="title" 
                        required 
                        className="input-field" 
                        value={formData.title} 
                        onChange={handleChange} 
                        placeholder="e.g. Evening Commute Home, Ride to Campus" 
                    />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">Starting Location *</label>
                        <input 
                            type="text" 
                            name="startAddress" 
                            required 
                            className="input-field" 
                            value={formData.startLocation.address} 
                            onChange={handleChange} 
                            placeholder="e.g. Office, Metro Station" 
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Destination *</label>
                        <input 
                            type="text" 
                            name="destAddress" 
                            required 
                            className="input-field" 
                            value={formData.destination.address} 
                            onChange={handleChange} 
                            placeholder="e.g. Home, Apartment 4B" 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Journey Date *</label>
                    <input 
                        type="date" 
                        name="journeyDate" 
                        required 
                        className="input-field" 
                        value={formData.journeyDate} 
                        onChange={handleChange} 
                        min={new Date().toISOString().split('T')[0]} 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">Planned Start Time *</label>
                        <input 
                            type="time" 
                            name="plannedStartTime" 
                            required 
                            className="input-field" 
                            value={formData.plannedStartTime.substring(0,5)} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Expected Arrival Time *</label>
                        <input 
                            type="time" 
                            name="expectedArrivalTime" 
                            required 
                            className="input-field" 
                            value={formData.expectedArrivalTime.substring(0,5)} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                {/* SAFETY BUFFER MINUTES */}
                <div className="input-group" style={{ background: 'rgba(99, 102, 241, 0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <Clock size={16} color="var(--primary)" /> Safety Buffer Window (Grace Period)
                    </label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0.6rem' }}>
                        Extra minutes granted before triggering overdue emergency alerts to your contacts (for minor traffic/transit delays).
                    </p>
                    <select 
                        name="safetyBufferMinutes" 
                        className="input-field" 
                        value={formData.safetyBufferMinutes ?? 10} 
                        onChange={handleChange}
                        style={{ cursor: 'pointer' }}
                    >
                        <option value={0}>0 minutes (Alert immediately at arrival time)</option>
                        <option value={5}>5 minutes grace buffer</option>
                        <option value={10}>10 minutes grace buffer (Recommended)</option>
                        <option value={15}>15 minutes grace buffer</option>
                        <option value={30}>30 minutes grace buffer</option>
                    </select>
                </div>

                {/* EMERGENCY CONTACTS SELECTION */}
                <div className="input-group" style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontWeight: 600 }}>
                            <Users size={16} color="var(--primary)" /> Emergency Contacts to Alert
                        </label>
                        {contacts.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <button type="button" onClick={selectAllContacts} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Select All</button>
                                <span>•</span>
                                <button type="button" onClick={deselectAllContacts} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Clear</button>
                            </div>
                        )}
                    </div>

                    {contacts.length === 0 ? (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                            No emergency contacts configured yet. Go to the Emergency Contacts page to add trusted guardians.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                            {contacts.map(c => {
                                const isChecked = selectedContactIds.includes(c.id);
                                return (
                                    <label 
                                        key={c.id} 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            padding: '0.5rem 0.75rem', 
                                            borderRadius: '6px', 
                                            background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                            border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => toggleContact(c.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <strong style={{ color: 'var(--text-main)' }}>{c.name}</strong>
                                            {c.relationship && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.3rem' }}>({c.relationship})</span>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="input-group" style={{ marginTop: '1rem' }}>
                    <label className="input-label">Description / Journey Notes (Optional)</label>
                    <textarea 
                        name="description" 
                        className="input-field" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows={2} 
                        style={{ resize: 'vertical' }} 
                        placeholder="Transport mode (e.g. Cab reg #KA01AB1234, Bus line #320)"
                    ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="btn" 
                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', width: 'auto' }}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading}
                        style={{ flex: 1 }}
                    >
                        {loading ? 'Saving...' : initialData ? 'Update Journey' : 'Create Smart Journey'}
                    </button>
                </div>
            </form>
        </div>
    );
};
