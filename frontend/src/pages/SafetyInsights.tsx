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
    <div className="animate-fade-in" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Sparkles size={15} /> SafeHer AI Intelligence Core
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: 0 }}>
            Safety Analytics & AI Insights
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.35rem', maxWidth: '680px' }}>
            Continuous threat pattern recognition, chronological safety diary analysis, and automated risk prevention advisories.
          </p>
        </div>

        <button 
          onClick={handleRunAIAnalysis} 
          disabled={analyzing}
          className="btn btn-primary" 
          style={{ width: 'auto', gap: '0.5rem', padding: '0.85rem 1.85rem', borderRadius: '14px', fontSize: '0.98rem' }}
        >
          {analyzing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Analyzing Diary Records...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Synthesize AI Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Logged Incidents
            </span>
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              Diary Vault
            </span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#8b5cf6', lineHeight: 1.1, margin: '0.35rem 0' }}>
            {diaryCount}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total private observations recorded
          </span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SOS Beacons
            </span>
            <span className="badge badge-danger">
              Emergency
            </span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ef4444', lineHeight: 1.1, margin: '0.35rem 0' }}>
            {sosCount}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Distress beacons dispatched
          </span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Vectors
            </span>
            <span className="badge badge-primary">
              Categorized
            </span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, margin: '0.35rem 0' }}>
            {Object.keys(categoryBreakdown).length}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Distinct incident classifications
          </span>
        </div>

      </div>

      {/* AI Insights Card */}
      {analysis && (
        <div className="card animate-slide-up" style={{ 
          marginBottom: '2.5rem', 
          border: '1.5px solid rgba(139, 92, 246, 0.35)', 
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          padding: '2.5rem',
          boxShadow: '0 12px 35px -5px rgba(139, 92, 246, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.65rem', borderRadius: '12px' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  AI Safety Pattern Synthesis
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 600 }}>
                  Model: SafeHer Behavioral Heuristics Engine
                </span>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '0.4rem 0.85rem' }}>
              Verified Synthesis
            </span>
          </div>

          <div style={{ background: 'var(--card-bg)', border: 'var(--glass-border)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
              {analysis.summary}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Patterns */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: 'var(--glass-border)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#8b5cf6" /> Identified Behavioral Patterns
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                {analysis.patterns?.map((p, i) => (
                  <li key={i} style={{ lineHeight: 1.5 }}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '16px', border: 'var(--glass-border)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#10b981" /> Tailored Safety Precautions
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-main)', fontSize: '0.92rem' }}>
                {analysis.recommendations?.map((r, i) => (
                  <li key={i} style={{ lineHeight: 1.5 }}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Disclaimer */}
          <div style={{ marginTop: '1.75rem', padding: '0.85rem 1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
            <strong>Safety AI Disclaimer:</strong> {analysis.disclaimer || "SafeHer AI insights highlight contextual patterns from self-reported diary entries and serve as situational guidance. They do not predict crime."}
          </div>
        </div>
      )}

      {/* Incident Categories Breakdown */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} color="var(--primary)" /> Incident Category Distribution
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {totalCategorized} Total Entries Analyzed
          </span>
        </div>

        {totalCategorized === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Activity size={36} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              No incident data logged yet. Add records in your Safety Diary to see visual threat vector distribution metrics.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.entries(categoryBreakdown).map(([category, count]) => {
              const percentage = Math.round((count / totalCategorized) * 100);
              return (
                <div key={category} style={{ background: 'rgba(99, 102, 241, 0.02)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{category.replace('_', ' ')}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{count} ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: '9999px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
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
