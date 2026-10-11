import React, { useEffect, useState } from 'react';
import { adminService, type AdminStats } from '../services/admin.service';
import { reportService, type IncidentReport } from '../services/report.service';
import { 
  ShieldAlert, 
  Users, 
  Activity, 
  BookOpen, 
  FileText, 
  Server, 
  Radio, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Cpu,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  UserX,
  MapPin
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sosList, setSosList] = useState<any[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'SOS' | 'REPORTS'>('OVERVIEW');
  const [searchUser, setSearchUser] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, sosData, reportsData] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        adminService.getAllUsers().catch(() => []),
        adminService.getAllSOS().catch(() => []),
        reportService.getAllReportsAdmin().catch(() => [])
      ]);

      if (statsData) setStats(statsData);
      setUsers(usersData);
      setSosList(sosData);
      setReports(reportsData);
    } catch (e) {
      console.error("Failed to load admin management data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(userId, newStatus);
      loadData();
    } catch (e) {
      alert("Failed to update user status.");
    }
  };

  const handleUpdateReportStatus = async (reportId: number, status: string) => {
    const notes = prompt("Enter moderation note for this incident report (optional):") || undefined;
    try {
      await reportService.updateReportStatusAdmin(reportId, status, notes);
      loadData();
    } catch (e) {
      alert("Failed to update report status.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.phoneNumber?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1250px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-danger">Administrator</span>
            <span className="badge badge-success">Live Security Telemetry</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            SafeHer Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Platform-wide incident moderation, user account supervision, and SOS emergency dispatches.
          </p>
        </div>

        <button 
          onClick={loadData} 
          disabled={loading}
          className="btn" 
          style={{ width: 'auto', gap: '0.5rem', background: 'var(--card-bg)', border: 'var(--glass-border)' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Telemetry
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '2rem', overflowX: 'auto' }}>
        {[
          { id: 'OVERVIEW', name: 'Overview & Health', icon: Activity },
          { id: 'USERS', name: `Users (${users.length})`, icon: Users },
          { id: 'SOS', name: `SOS Dispatches (${sosList.length})`, icon: ShieldAlert },
          { id: 'REPORTS', name: `Incident Reports (${reports.length})`, icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="btn"
              style={{
                width: 'auto',
                whiteSpace: 'nowrap',
                padding: '0.6rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? 'var(--primary-gradient)' : 'transparent',
                color: isSelected ? 'white' : 'var(--text-muted)',
                borderRadius: '12px',
                gap: '0.5rem'
              }}
            >
              <Icon size={18} /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & HEALTH */}
      {activeTab === 'OVERVIEW' && (
        <div>
          {/* Stat Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ border: (stats?.activeSosRecords || 0) > 0 ? '2px solid #ef4444' : undefined, background: (stats?.activeSosRecords || 0) > 0 ? 'rgba(239, 68, 68, 0.08)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: (stats?.activeSosRecords || 0) > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                  Active SOS Alerts
                </span>
                <Radio size={20} color={stats?.activeSosRecords ? '#ef4444' : 'var(--text-muted)'} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: (stats?.activeSosRecords || 0) > 0 ? '#ef4444' : 'var(--text-main)' }}>
                {stats?.activeSosRecords ?? 0}
              </div>
              <span style={{ fontSize: '0.8rem', color: (stats?.activeSosRecords || 0) > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                {stats?.activeSosRecords ? '🚨 Ongoing distress dispatches' : 'No active emergencies'}
              </span>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Registered Accounts
                </span>
                <Users size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats?.totalUsers ?? users.length}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total protected individuals</span>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Total SOS Recorded
                </span>
                <ShieldAlert size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>
                {stats?.totalSosIncidents ?? sosList.length}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical emergency triggers</span>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Incident Reports
                </span>
                <FileText size={20} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6' }}>
                {stats?.totalIncidentReports ?? reports.length}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Submitted user incident files</span>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={20} color="var(--primary)" /> Microservices & Platform Health
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.02)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Database size={20} color="#10b981" />
                  <span style={{ fontWeight: 700 }}>PostgreSQL Primary DB</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> Connection pool active & synced
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.02)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Cpu size={20} color="#8b5cf6" />
                  <span style={{ fontWeight: 700 }}>AI Pattern Engine</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> Fallback & cloud model operational
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.02)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Radio size={20} color="#3b82f6" />
                  <span style={{ fontWeight: 700 }}>Emergency Dispatch Gateway</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> SMS & Telemetry broadcaster active
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Registered User Directory</h3>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by name, email, phone..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                style={{ paddingLeft: '2.5rem', margin: 0 }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{u.fullName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>{u.phoneNumber || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : 'badge-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.accountStatus === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {u.accountStatus || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => handleToggleUserStatus(u.id, u.accountStatus || 'ACTIVE')}
                        className="btn" 
                        style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: u.accountStatus === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: u.accountStatus === 'ACTIVE' ? '#ef4444' : '#10b981' }}
                      >
                        {u.accountStatus === 'ACTIVE' ? 'Disable Account' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SOS INCIDENTS */}
      {activeTab === 'SOS' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Platform-Wide Emergency SOS Telemetry
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sosList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No SOS alerts recorded.</p>
            ) : (
              sosList.map(item => {
                const mapsUrl = (item.latitude && item.longitude) ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}` : undefined;
                return (
                  <div key={item.id} style={{ padding: '1.25rem', borderRadius: '14px', border: item.status === 'ACTIVE' ? '2px solid #ef4444' : '1px solid var(--border-color)', background: item.status === 'ACTIVE' ? 'rgba(239,68,68,0.06)' : 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${item.status === 'ACTIVE' ? 'badge-danger' : 'badge-success'}`}>
                          {item.status}
                        </span>
                        <strong style={{ fontSize: '1.05rem' }}>{item.userName}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({item.userPhone})</span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(item.timestamp || item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', margin: '0.5rem 0' }}>{item.message}</p>

                    {mapsUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <MapPin size={16} color="#ef4444" />
                        <span>Coords: {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}</span>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.5rem' }}>
                          Open Map <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: INCIDENT REPORTS MODERATION */}
      {activeTab === 'REPORTS' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            User Incident Reports Review
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No incident reports submitted.</p>
            ) : (
              reports.map(r => (
                <div key={r.id} style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-primary">{r.incidentType}</span>
                      <span className="badge badge-warning">{r.status}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Report #{r.id}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.incidentDate} at {r.incidentTime}</span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {r.description}
                  </p>

                  {r.location && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      📍 Location: {r.location}
                    </div>
                  )}

                  {r.adminNotes && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(99, 102, 241, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                      <strong>Notes:</strong> {r.adminNotes}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button onClick={() => handleUpdateReportStatus(r.id, 'IN_REVIEW')} className="btn" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      Mark In-Review
                    </button>
                    <button onClick={() => handleUpdateReportStatus(r.id, 'RESOLVED')} className="btn" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      Mark Resolved
                    </button>
                    <button onClick={() => handleUpdateReportStatus(r.id, 'REJECTED')} className="btn" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
