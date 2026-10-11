import React, { useState, useEffect } from 'react';
import { safetyTipService, type SafetyTip } from '../services/safetytip.service';
import { 
  Lightbulb, 
  Search, 
  ShieldCheck, 
  Car, 
  Globe, 
  Bus, 
  AlertTriangle, 
  Lock,
  ChevronRight
} from 'lucide-react';

export const SafetyTips: React.FC = () => {
  const [tips, setTips] = useState<SafetyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultTips: SafetyTip[] = [
    {
      id: 1,
      title: "Solo Travel & Cab Verification",
      content: "Always check that child-lock is disengaged, confirm the license plate matches your booking app, and share the live trip link with a trusted contact before starting the ride.",
      category: "TRAVEL_SAFETY",
      isActive: true
    },
    {
      id: 2,
      title: "Online Privacy & Geo-Tagging",
      content: "Turn off background EXIF location data on photos shared to public social media accounts. Avoid posting real-time location stories until after you have safely departed the venue.",
      category: "DIGITAL_PRIVACY",
      isActive: true
    },
    {
      id: 3,
      title: "Public Transit Awareness",
      content: "When commuting late on trains or buses, sit near the conductor, driver, or well-lit women compartments. Keep headphones at low volume to maintain peripheral situational awareness.",
      category: "PUBLIC_TRANSPORT",
      isActive: true
    },
    {
      id: 4,
      title: "Situational De-Escalation",
      content: "If you feel followed, change direction toward a populated commercial venue, enter a store, and inform staff immediately. Never head straight to an isolated private residence.",
      category: "PERSONAL_SAFETY",
      isActive: true
    },
    {
      id: 5,
      title: "Emergency Power & Preparedness",
      content: "Keep a portable power bank charged in your bag. Pre-configure primary emergency contacts on speed dial and ensure your SafeHer login token is active.",
      category: "EMERGENCY_PREP",
      isActive: true
    },
    {
      id: 6,
      title: "Digital Harassment Documentation",
      content: "Preserve timestamps, profile URLs, and unedited full screenshots of abusive or threatening digital messages before blocking perpetrators to maintain legal evidence.",
      category: "ONLINE_SAFETY",
      isActive: true
    }
  ];

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const categoryParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const data = await safetyTipService.getTips(categoryParam);
        if (data && data.length > 0) {
          setTips(data);
        } else {
          setTips(defaultTips);
        }
      } catch (err) {
        setTips(defaultTips);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, [selectedCategory]);

  const categories = [
    { id: 'ALL', name: 'All Categories', icon: Lightbulb },
    { id: 'PERSONAL_SAFETY', name: 'Personal Safety', icon: ShieldCheck },
    { id: 'TRAVEL_SAFETY', name: 'Travel & Cabs', icon: Car },
    { id: 'ONLINE_SAFETY', name: 'Online Safety', icon: Globe },
    { id: 'PUBLIC_TRANSPORT', name: 'Public Transit', icon: Bus },
    { id: 'EMERGENCY_PREP', name: 'Emergency Prep', icon: AlertTriangle },
    { id: 'DIGITAL_PRIVACY', name: 'Digital Privacy', icon: Lock }
  ];

  const filteredTips = tips.filter(t => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1150px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.6rem', borderRadius: '12px' }}>
            <Lightbulb size={26} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Curated Safety Tips & Guidance
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
          Verified situational strategies, transit advice, and digital security precautions curated by safety experts.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search safety tips or keywords (e.g. cab, night, harassment)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem', margin: 0 }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className="btn"
                style={{
                  width: 'auto',
                  whiteSpace: 'nowrap',
                  padding: '0.5rem 1rem',
                  fontSize: '0.88rem',
                  background: isSelected ? 'var(--primary-gradient)' : 'var(--card-bg)',
                  color: isSelected ? 'white' : 'var(--text-main)',
                  border: isSelected ? 'none' : 'var(--glass-border)',
                  borderRadius: '9999px',
                  gap: '0.4rem'
                }}
              >
                <Icon size={16} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips Grid */}
      {filteredTips.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No safety tips found matching "{searchQuery}".
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredTips.map((tip) => (
            <div 
              key={tip.id} 
              className="card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-warning">
                    {tip.category.replace('_', ' ')}
                  </span>
                  <ShieldCheck size={18} color="#10b981" />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  {tip.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {tip.content}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SafeHer Verified Standard</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  Learn More <ChevronRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
