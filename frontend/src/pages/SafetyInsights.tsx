import React, { useEffect, useState } from 'react';
import { aiService, type AIAnalysisResult } from '../services/ai.service';
import { diaryService } from '../services/diary.service';
import { sosService } from '../services/sos.service';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  PieChart, 
  Activity, 
  Clock, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export const SafetyInsights: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [diaryCount, setDiaryCount] = useState(0);
  const [sosCount, setSosCount] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entries, sosHistory] = await Promise.all([
        diaryService.getEntries(),
        sosService.getSOSHistory()
      ]);

      setDiaryCount(entries.length);
      setSosCount(sosHistory.length);

      const breakdown: { [key: string]: number } = {};
      entries.forEach((e: any) => {
        const type = e.incidentType || 'OTHER';
        breakdown[type] = (breakdown[type] || 0) + 1;
      });
      setCategoryBreakdown(breakdown);

    } catch (e) {
      console.error("Failed to fetch analytics baseline", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAIAnalysis = async () => {
    if (!window.confirm("Your private diary records will be evaluated by the SafeHer AI engine to discover recurring safety patterns and precautions. Continue?")) return;

    setAnalyzing(true);
    try {
      const result = await aiService.analyzeDiary();
      setAnalysis(result);
    } catch (e) {
      alert("Failed to analyze diary records.");
    } finally {
      setAnalyzing(false);
    }
  };

  const totalCategorized = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1150px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.6rem', borderRadius: '12px' }}>
              <Sparkles size={26} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Safety Analytics & AI Insights
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
            Personal risk patterns, incident categorization, and intelligent AI precautions.
          </p>
        </div>

        <button 
          onClick={handleRunAIAnalysis} 
          disabled={analyzing}
          className="btn btn-primary" 
          style={{ width: 'auto', gap: '0.5rem', padding: '0.75rem 1.75rem' }}
        >
          <Sparkles size={18} />
          {analyzing ? 'AI Analyzing...' : 'Generate New AI Analysis'}
        </button>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Logged Incidents</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#8b5cf6', margin: '0.25rem 0' }}>{diaryCount}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Private diary entries</span>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SOS Beacons Dispatched</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>{sosCount}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical emergency alerts</span>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Incident Categories</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', margin: '0.25rem 0' }}>
            {Object.keys(categoryBreakdown).length}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distinct threat vectors logged</span>
        </div>
      </div>

      {/* AI Insights Card */}
      {analysis && (
        <div className="card" style={{ 
          marginBottom: '2.5rem', 
          border: '2px solid rgba(139, 92, 246, 0.4)', 
          background: 'rgba(139, 92, 246, 0.05)',
          padding: '2.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Sparkles size={26} color="#8b5cf6" />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>
              AI Safety Pattern Synthesis
            </h3>
          </div>

          <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {analysis.summary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Patterns */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: 'var(--glass-border)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#8b5cf6" /> Observed Patterns
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                {analysis.patterns?.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: 'var(--glass-border)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#10b981" /> Tailored Safety Recommendations
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                {analysis.recommendations?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Disclaimer */}
          <div style={{ marginTop: '1.5rem', padding: '0.85rem 1.25rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>SafeHer AI Disclaimer:</strong> {analysis.disclaimer || "AI insights provide general situational observations from your entries and never claim to predict crime."}
          </div>
        </div>
      )}

      {/* Incident Categories Breakdown */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={20} color="var(--primary)" /> Incident Category Distribution
        </h3>

        {totalCategorized === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No incident data logged yet. Add records in your Safety Diary to see visual distribution metrics.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(categoryBreakdown).map(([category, count]) => {
              const percentage = Math.round((count / totalCategorized) * 100);
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{category.replace('_', ' ')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: '9999px', transition: 'width 0.8s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
