import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contact.service';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [primaryContact, setPrimaryContact] = useState<string>('None');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contacts = await contactService.getAll();
        const active = contacts.filter((c: any) => c.isActive);
        setActiveCount(active.length);
        if (active.length > 0) {
          const sorted = active.sort((a: any, b: any) => a.priority - b.priority);
          setPrimaryContact(`${sorted[0].relationship} (${sorted[0].name})`);
        }
      } catch (e) {
        // ignore errors on dashboard
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome, {user?.fullName}.</p>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <h3>Emergency Contacts</h3>
          <p>{activeCount} Active</p>
          <p><strong>Primary Contact:</strong> {primaryContact}</p>
          <a href="/emergency-contacts" style={{ color: 'var(--primary)' }}>Manage Contacts</a>
        </div>
        <div className="card">
          <h3>Smart Journey</h3>
          <p>Register and track your trips.</p>
          <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}><strong style={{ color: 'var(--success)' }}>Active:</strong> View your active and upcoming journeys.</p>
          <a href="/journey" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Manage Journeys</a>
        </div>
        <div className="card"><h3>SOS Features</h3><p>Coming soon</p></div>
      </div>
    </div>
  );
};
