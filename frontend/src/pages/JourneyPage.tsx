import React, { useEffect, useState } from 'react';
import { journeyService, Journey, JourneyStatus, CreateJourneyRequest } from '../services/journey.service';
import { JourneyList } from '../components/journey/JourneyList';
import { JourneyForm } from '../components/journey/JourneyForm';

export const JourneyPage: React.FC = () => {
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const loadJourneys = async () => {
        setLoading(true);
        try {
            const data = await journeyService.getJourneys();
            setJourneys(data);
        } catch (e) {
            console.error("Failed to load journeys", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJourneys();
    }, []);

    const handleCreate = async (data: CreateJourneyRequest) => {
        setFormLoading(true);
        try {
            await journeyService.createJourney(data);
            setView('list');
            loadJourneys();
        } catch (e) {
            console.error(e);
            alert("Failed to create journey");
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (data: CreateJourneyRequest) => {
        if (!editingJourney) return;
        setFormLoading(true);
        try {
            await journeyService.updateJourney(editingJourney.id, data);
            setEditingJourney(null);
            setView('list');
            loadJourneys();
        } catch (e) {
            console.error(e);
            alert("Failed to update journey");
        } finally {
            setFormLoading(false);
        }
    };

    const handleStart = async (id: string) => {
        try {
            await journeyService.startJourney(id);
            loadJourneys();
        } catch (e) {
            alert("Failed to start journey");
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await journeyService.completeJourney(id);
            loadJourneys();
        } catch (e) {
            alert("Failed to complete journey");
        }
    };

    const handleCancel = async (id: string) => {
        if(window.confirm('Are you sure you want to cancel this journey?')) {
            try {
                await journeyService.cancelJourney(id);
                loadJourneys();
            } catch (e) {
                alert("Failed to cancel journey");
            }
        }
    };

    const openEditForm = (j: Journey) => {
        setEditingJourney(j);
        setView('edit');
    };

    const activeJourneys = journeys.filter(j => j.status === JourneyStatus.ACTIVE);
    const upcomingJourneys = journeys.filter(j => j.status === JourneyStatus.PLANNED);
    const pastJourneys = journeys.filter(j => j.status === JourneyStatus.COMPLETED || j.status === JourneyStatus.CANCELLED);

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Smart Journey</h2>
                {view === 'list' && (
                    <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setView('create')}>
                        + Register New Journey
                    </button>
                )}
            </div>

            {view === 'create' && (
                <JourneyForm 
                    onSubmit={handleCreate} 
                    onCancel={() => setView('list')} 
                    loading={formLoading} 
                />
            )}

            {view === 'edit' && editingJourney && (
                <JourneyForm 
                    initialData={{
                        title: editingJourney.title,
                        startLocation: editingJourney.startLocation,
                        destination: editingJourney.destination,
                        journeyDate: editingJourney.journeyDate,
                        plannedStartTime: editingJourney.plannedStartTime,
                        expectedArrivalTime: editingJourney.expectedArrivalTime,
                        description: editingJourney.description
                    }}
                    onSubmit={handleUpdate} 
                    onCancel={() => { setView('list'); setEditingJourney(null); }} 
                    loading={formLoading} 
                />
            )}

            {view === 'list' && (
                <div>
                    {loading ? (
                        <p>Loading journeys...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {activeJourneys.length > 0 && (
                                <section>
                                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Active Journey</h3>
                                    <JourneyList 
                                        journeys={activeJourneys} 
                                        onEdit={openEditForm} 
                                        onStart={handleStart} 
                                        onComplete={handleComplete} 
                                        onCancel={handleCancel} 
                                    />
                                </section>
                            )}

                            <section>
                                <h3 style={{ marginBottom: '1rem' }}>Upcoming Journeys</h3>
                                <JourneyList 
                                    journeys={upcomingJourneys} 
                                    onEdit={openEditForm} 
                                    onStart={handleStart} 
                                    onComplete={handleComplete} 
                                    onCancel={handleCancel} 
                                />
                            </section>

                            <section>
                                <h3 style={{ marginBottom: '1rem' }}>Past Journeys</h3>
                                <JourneyList 
                                    journeys={pastJourneys} 
                                    onEdit={openEditForm} 
                                    onStart={handleStart} 
                                    onComplete={handleComplete} 
                                    onCancel={handleCancel} 
                                />
                            </section>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
