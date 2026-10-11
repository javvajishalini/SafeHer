import React, { useState, useEffect } from 'react';
import { reportService, type IncidentReport } from '../services/report.service';
import { useToast } from '../context/ToastContext';
import { 
  FileText, 
  PlusCircle, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ShieldAlert, 
  X, 
  Calendar,
  Send
} from 'lucide-react';

export const IncidentReports: React.FC = () => {
  const { success: toastSuccess, error: toastError, warning } = useToast();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    incidentType: 'HARASSMENT',
    description: '',
    location: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5)
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getUserReports();
      setReports(data);
    } catch (err) {
      setError('Failed to fetch submitted incident reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setError('Please provide a description of the incident.');
      warning('Please provide a description of the incident.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await reportService.createReport(formData);
      setSuccess('Incident report recorded successfully.');
      toastSuccess('Incident report submitted and recorded successfully.');
      setShowModal(false);
      setFormData({
        incidentType: 'HARASSMENT',
        description: '',
        location: '',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toTimeString().slice(0, 5)
      });
      fetchReports();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit incident report';
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '12px' }}>
              <FileText size={26} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Incident Reporting System
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Document and log formal safety incidents with timestamps and location references.
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
          style={{ width: 'auto', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
        >
          <PlusCircle size={18} /> File Incident Report
        </button>
      </div>

      {/* Legal Disclaimer */}
      <div style={{ 
        background: 'rgba(245, 158, 11, 0.08)', 
        border: '1px solid rgba(245, 158, 11, 0.25)', 
        borderRadius: '14px', 
        padding: '1rem 1.25rem', 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.88rem'
      }}>
        <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Important Advisory:</strong> Submitting an in-app report records the event securely in SafeHer for auditing, analytics, and personal documentation. An in-app report does <em>not</em> automatically constitute a formal Police FIR or emergency dispatch. In acute danger, please dial 112 directly.
        </span>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your incident reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <FileText size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Incident Reports Recorded</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0.4rem auto 1.5rem', fontSize: '0.95rem' }}>
            If you experience or witness an unsafe incident, record a detailed report here for your personal records and analytics.
          </p>
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary" 
            style={{ width: 'auto', margin: '0 auto', gap: '0.5rem' }}
          >
            <PlusCircle size={18} /> File First Incident Report
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reports.map((r) => (
            <div key={r.id} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-primary">
                    {r.incidentType.replace('_', ' ')}
                  </span>
                  <span className="badge badge-success">
                    {r.status || 'SUBMITTED'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Report #{r.id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Clock size={16} />
                  <span>{r.incidentDate} at {r.incidentTime}</span>
                </div>
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1rem' }}>
                {r.description}
              </p>

              {r.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span>Location: {r.location}</span>
                </div>
              )}

              {r.adminNotes && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>Admin Moderation Note:</strong> {r.adminNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Report Modal Form */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100vh', 
          background: 'rgba(0, 0, 0, 0.6)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000, 
          padding: '1.5rem' 
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                File New Incident Report
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Incident Category *</label>
                <select 
                  className="input-field" 
                  value={formData.incidentType}
                  onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                  required
                >
                  <option value="HARASSMENT">Harassment / Catcalling</option>
                  <option value="STALKING">Stalking / Following</option>
                  <option value="UNSAFE_AREA">Unsafe Route / Poor Lighting</option>
                  <option value="ONLINE_THREAT">Online Cyberbullying / Threats</option>
                  <option value="SUSPICIOUS_ACTIVITY">Suspicious Individual / Activity</option>
                  <option value="TRAVEL_CONCERN">Cab / Public Transit Concern</option>
                  <option value="PHYSICAL_ASSAULT">Physical Assault / Threat</option>
                  <option value="OTHER">Other Safety Concern</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Location / Address (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Metro Station Gate 3, MG Road"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Date *</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Time *</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={formData.incidentTime}
                    onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Description *</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  placeholder="Describe what occurred, any identifying traits, vehicle numbers, or relevant context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn" 
                  style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary" 
                  style={{ width: 'auto', gap: '0.4rem', padding: '0.75rem 1.75rem' }}
                >
                  <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
