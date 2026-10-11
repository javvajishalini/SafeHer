import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { diaryService } from '../services/diary.service';
import { 
  BookOpen, 
  PlusCircle, 
  Sparkles, 
  Search, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  Filter,
  CheckCircle
} from 'lucide-react';

export const SafetyDiary: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5),
    incidentType: 'HARASSMENT',
    riskLevel: 'LOW',
    location: ''
  });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await diaryService.getEntries();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please enter title and description");
      return;
    }

    setSubmitting(true);
    try {
      await diaryService.createEntry(formData);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toTimeString().slice(0, 5),
        incidentType: 'HARASSMENT',
        riskLevel: 'LOW',
        location: ''
      });
      fetchEntries();
    } catch (e) {
      alert("Failed to save diary entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this private diary log?")) return;
    try {
      await diaryService.deleteEntry(id);
      fetchEntries();
    } catch (e) {
      alert("Failed to delete entry.");
    }
  };

  const filteredEntries = entries.filter(item => {
    const matchesRisk = filterRisk === 'ALL' || item.riskLevel === filterRisk;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.6rem', borderRadius: '12px' }}>
              <BookOpen size={26} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Private Safety Diary
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            A secure personal vault to log uncomfortable or suspicious events with full privacy encryption.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link 
            to="/safety-insights" 
            className="btn" 
            style={{ width: 'auto', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
          >
            <Sparkles size={18} /> View AI Insights
          </Link>

          <button 
            onClick={() => setShowForm(!showForm)} 
            className="btn btn-primary"
            style={{ width: 'auto', gap: '0.4rem', padding: '0.75rem 1.5rem' }}
          >
            <PlusCircle size={18} /> New Entry
          </button>
        </div>
      </div>

      {/* New Entry Drawer/Form */}
      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: '2.5rem', border: '2px solid rgba(139, 92, 246, 0.4)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
              Log an Unsafe Incident / Observation
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Title / Brief Summary *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Uncomfortable interaction near bus terminal" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Category *</label>
                <select 
                  className="input-field" 
                  value={formData.incidentType}
                  onChange={e => setFormData({ ...formData, incidentType: e.target.value })}
                  required
                >
                  <option value="HARASSMENT">Harassment / Catcalling</option>
                  <option value="STALKING">Stalking / Followed</option>
                  <option value="UNSAFE_AREA">Unsafe Area / Poor Lighting</option>
                  <option value="ONLINE_THREAT">Online Cyberbullying / Threats</option>
                  <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                  <option value="TRAVEL_CONCERN">Cab / Transit Concern</option>
                  <option value="OTHER">Other Observation</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Perceived Risk Level *</label>
                <select 
                  className="input-field" 
                  value={formData.riskLevel}
                  onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                  required
                >
                  <option value="LOW">Low Concern</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Severity</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Location / Landmark (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Park Street Corner" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Date *</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.incidentDate}
                  onChange={e => setFormData({ ...formData, incidentDate: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Time *</label>
                <input 
                  type="time" 
                  className="input-field" 
                  value={formData.incidentTime}
                  onChange={e => setFormData({ ...formData, incidentTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Detailed Notes & Context *</label>
              <textarea 
                className="input-field" 
                rows={4}
                placeholder="What happened? Any vehicle plate, clothing, physical description, or context to remember..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="btn" 
                style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '0.75rem 1.75rem' }}
              >
                {submitting ? 'Saving...' : 'Save Private Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search diary entries..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem', margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.35rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className="btn"
              style={{
                width: 'auto',
                padding: '0.4rem 0.85rem',
                fontSize: '0.85rem',
                background: filterRisk === r ? 'var(--primary-gradient)' : 'transparent',
                color: filterRisk === r ? 'white' : 'var(--text-muted)',
                borderRadius: '8px'
              }}
            >
              {r === 'ALL' ? 'All Risks' : `${r} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Diary Entries List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your private safety diary...
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', marginBottom: '1rem' }}>
            <BookOpen size={36} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>No Diary Entries Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0.4rem auto 1.5rem', fontSize: '0.95rem' }}>
            {searchQuery || filterRisk !== 'ALL' ? 'No entries match your search/filter criteria.' : 'Keep a private log of situations where you felt uneasy to track patterns with AI.'}
          </p>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary" 
            style={{ width: 'auto', margin: '0 auto', gap: '0.5rem' }}
          >
            <PlusCircle size={18} /> Write First Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredEntries.map(item => {
            const riskColor = item.riskLevel === 'HIGH' ? '#ef4444' : (item.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981');
            return (
              <div key={item.id} className="card" style={{ padding: '1.75rem', borderLeft: `4px solid ${riskColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                        {item.incidentType?.replace('_', ' ')}
                      </span>
                      <span className="badge" style={{ background: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}30`, fontSize: '0.75rem' }}>
                        {item.riskLevel} RISK
                      </span>
                      {item.location && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} /> {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <Clock size={15} />
                      <span>{item.incidentDate} • {item.incidentTime}</span>
                    </div>

                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="btn" 
                      style={{ width: 'auto', padding: '0.35rem 0.65rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                      title="Delete entry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: 1.6, marginTop: '0.5rem' }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
