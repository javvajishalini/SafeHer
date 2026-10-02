import React, { useEffect, useState } from 'react';
import { diaryService, aiService } from '../services/diary.service';

export const SafetyDiary: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', incidentDate: '', incidentTime: '', incidentType: 'OTHER', riskLevel: 'LOW'
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await diaryService.getEntries();
      setEntries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await diaryService.createEntry(formData);
      setShowForm(false);
      setFormData({ title: '', description: '', incidentDate: '', incidentTime: '', incidentType: 'OTHER', riskLevel: 'LOW' });
      fetchEntries();
    } catch (e) {
      alert("Failed to save entry");
    }
  };

  const handleAnalyze = async () => {
    if (!window.confirm("Your selected diary content will be sent to the configured AI provider for analysis. Continue?")) return;
    
    setIsAnalyzing(true);
    try {
      const result = await aiService.analyzeDiary();
      setAnalysis(result);
    } catch (e) {
      alert("Failed to analyze diary");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Safety Diary</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="btn" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze My Diary'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'New Entry'}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="card" style={{ marginBottom: '2rem', border: '2px solid #8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>AI Safety Insights</h3>
          <p style={{ fontWeight: 'bold' }}>{analysis.summary}</p>
          
          <h4 style={{ marginTop: '1rem' }}>Observed Patterns:</h4>
          <ul>{analysis.patterns.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
          
          <h4 style={{ marginTop: '1rem' }}>Recommendations:</h4>
          <ul>{analysis.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.9rem', color: '#64748b' }}>
            {analysis.disclaimer}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Log an Incident</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input type="text" className="form-control" placeholder="Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea className="form-control" placeholder="Description of what happened..." required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="date" className="form-control" required value={formData.incidentDate} onChange={e => setFormData({...formData, incidentDate: e.target.value})} />
              <input type="time" className="form-control" required value={formData.incidentTime} onChange={e => setFormData({...formData, incidentTime: e.target.value})} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select className="form-control" value={formData.incidentType} onChange={e => setFormData({...formData, incidentType: e.target.value})}>
                <option value="HARASSMENT">Harassment</option>
                <option value="STALKING">Stalking</option>
                <option value="UNSAFE_AREA">Unsafe Area</option>
                <option value="ONLINE_THREAT">Online Threat</option>
                <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                <option value="TRAVEL_CONCERN">Travel Concern</option>
                <option value="OTHER">Other</option>
              </select>
              <select className="form-control" value={formData.riskLevel} onChange={e => setFormData({...formData, riskLevel: e.target.value})}>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Entry</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No diary entries yet. Log incidents to receive AI safety insights.</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{entry.title}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{entry.incidentDate} {entry.incidentTime}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{entry.incidentType.replace('_', ' ')}</span>
                <span style={{ backgroundColor: entry.riskLevel === 'HIGH' ? '#fecaca' : entry.riskLevel === 'MEDIUM' ? '#fef08a' : '#bbf7d0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{entry.riskLevel} RISK</span>
              </div>
              <p>{entry.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
