import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome to your SafeHer dashboard, {user?.fullName}.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <h3>Emergency Contacts</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Coming in Phase 3</p>
        </div>
        <div className="card">
          <h3>Smart Journey</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Coming in Phase 4</p>
        </div>
        <div className="card">
          <h3>SOS Features</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Coming in Phase 6</p>
        </div>
      </div>
    </div>
  );
};
