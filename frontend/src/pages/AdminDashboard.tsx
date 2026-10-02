import React, { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch admin stats");
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Admin Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Platform-wide overview and statistics.</p>

      {stats ? (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Total Users</h3>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalUsers}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Total SOS Incidents</h3>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalSosIncidents}</p>
          </div>
          <div className="card" style={{ textAlign: 'center', border: stats.activeSosRecords > 0 ? '2px solid var(--danger)' : '' }}>
            <h3 style={{ color: 'var(--danger)' }}>Active SOS Records</h3>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--danger)' }}>{stats.activeSosRecords}</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Incident Reports</h3>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.totalIncidentReports}</p>
          </div>
        </div>
      ) : (
        <p>Loading statistics...</p>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h3>Platform Health</h3>
        <div className="card" style={{ marginTop: '1rem', backgroundColor: '#f8fafc' }}>
          <p><strong>Database:</strong> Connected</p>
          <p><strong>AI Service:</strong> Operational</p>
          <p><strong>SMS Provider:</strong> Operational</p>
        </div>
      </div>
    </div>
  );
};
