import React from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  HeartHandshake, 
  LifeBuoy, 
  Phone, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const EmergencyServices: React.FC = () => {
  const helplines = [
    {
      title: "National Emergency Number",
      number: "112",
      description: "All-in-one unified emergency response service for Police, Fire, and Medical assistance.",
      badge: "Primary Response",
      color: "#ef4444",
      icon: ShieldAlert
    },
    {
      title: "Women Helpline (Domestic Abuse & Distress)",
      number: "181",
      description: "24x7 toll-free emergency response and support for women facing violence, harassment, or distress.",
      badge: "Women Safety",
      color: "#8b5cf6",
      icon: ShieldCheck
    },
    {
      title: "Women Police Helpline",
      number: "1091",
      description: "Direct dispatch line to specialized women safety police units and flying squads.",
      badge: "Law Enforcement",
      color: "#6366f1",
      icon: ShieldAlert
    },
    {
      title: "Emergency Ambulance & Medical Response",
      number: "108",
      description: "Immediate emergency medical technician and hospital transit dispatch service.",
      badge: "Medical Emergency",
      color: "#10b981",
      icon: Activity
    },
    {
      title: "Childline Emergency Support",
      number: "1098",
      description: "24-hour nationwide emergency phone outreach service for children and minors in need of care & protection.",
      badge: "Child Protection",
      color: "#f59e0b",
      icon: HeartHandshake
    },
    {
      title: "Mental Health & Crisis Tele-Support",
      number: "14416",
      description: "National tele-mental health support service offering confidential counseling and distress relief.",
      badge: "Mental Wellness",
      color: "#0ea5e9",
      icon: LifeBuoy
    }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.6rem', borderRadius: '12px' }}>
            <PhoneCall size={26} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Emergency Services Directory
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
          Verified 24/7 institutional helplines, rapid police dispatch, and medical assistance.
        </p>
      </div>

      {/* Guidance Alert */}
      <div style={{ 
        background: 'rgba(99, 102, 241, 0.08)', 
        border: '1px solid rgba(99, 102, 241, 0.25)', 
        borderRadius: '14px', 
        padding: '1.25rem', 
        marginBottom: '2.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}>
        <AlertCircle size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Emergency Guidance Note
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
            All phone numbers below are direct interactive links. Tapping <strong>"Call Now"</strong> will prompt your device's native phone dialer. SafeHer never makes background phone calls without your explicit authorization.
          </p>
        </div>
      </div>

      {/* Helplines Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {helplines.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="card"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderLeft: `4px solid ${item.color}`
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ background: `${item.color}20`, color: item.color, padding: '0.75rem', borderRadius: '14px' }}>
                    <Icon size={24} />
                  </div>
                  <span className="badge" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                    {item.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: item.color }}>
                  {item.number}
                </div>

                <a 
                  href={`tel:${item.number}`}
                  className="btn"
                  style={{ 
                    width: 'auto', 
                    background: item.color, 
                    color: 'white', 
                    padding: '0.65rem 1.4rem', 
                    fontSize: '0.95rem', 
                    fontWeight: 700,
                    gap: '0.4rem',
                    boxShadow: `0 4px 15px ${item.color}40`
                  }}
                >
                  <Phone size={16} /> Call {item.number}
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
