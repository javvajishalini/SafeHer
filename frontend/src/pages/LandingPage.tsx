import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  ShieldAlert, 
  Users, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  PhoneCall, 
  Mic, 
  Phone, 
  Lightbulb, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Radio,
  FileCheck
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      
      {/* HERO SECTION */}
      <section style={{ 
        padding: '5rem 1.5rem 4rem', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Sparkles size={16} /> AI-Powered Women Safety Platform
        </div>

        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          fontWeight: 800, 
          letterSpacing: '-1px', 
          lineHeight: 1.15, 
          color: 'var(--text-main)',
          maxWidth: '900px',
          margin: '0 auto 1.5rem'
        }}>
          Your Safety. Your Power. <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Your Support.
          </span>
        </h1>

        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--text-muted)', 
          maxWidth: '720px', 
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          SafeHer brings emergency assistance, trusted contacts, location sharing, intelligent AI safety insights, and essential protection tools together into one secure, privacy-first platform.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/register" 
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', gap: '0.5rem' }}
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
          <a 
            href="#features" 
            className="btn" 
            style={{ 
              width: 'auto', 
              padding: '1rem 2rem', 
              fontSize: '1.1rem', 
              background: 'var(--card-bg)', 
              border: 'var(--glass-border)',
              color: 'var(--text-main)'
            }}
          >
            Explore Features
          </a>
        </div>

        {/* Hero Visual Card Showcase */}
        <div style={{ marginTop: '4rem' }}>
          <div className="card" style={{ 
            maxWidth: '960px', 
            margin: '0 auto', 
            padding: '2rem', 
            border: '2px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 20px 60px -15px rgba(99, 102, 241, 0.25)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <ShieldAlert size={20} /> Instant SOS Beacon
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  1-tap emergency dispatch with real-time GPS coordinates.
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Users size={20} /> Priority Safety Circle
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Multi-tier emergency responder notification order.
                </p>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Sparkles size={20} /> AI Safety Guardian
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Real-time safety guidance and pattern recognition analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Comprehensive Protection</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Every Tool You Need for Total Peace of Mind
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Built with cutting-edge tech, accessible anywhere from any mobile browser or desktop.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Feature 1: SOS */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Emergency SOS Dispatch</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              A high-visibility SOS beacon that immediately broadcasts your situation, status, and precise coordinates to your trusted responders.
            </p>
          </div>

          {/* Feature 2: Contacts */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Trusted Contacts Network</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Organize your family, close friends, and guardians with priority responder rankings, 1-click calls, and toggle availability.
            </p>
          </div>

          {/* Feature 3: Location */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Live Location Sharing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Generate instant Google Maps links and share your coordinates with trusted contacts via native device share or clipboard copy.
            </p>
          </div>

          {/* Feature 4: Safety Diary */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Private Safety Diary</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Privately log incidents of harassment, stalking, unsafe routes, or threats with timestamps, risk levels, and encrypted privacy.
            </p>
          </div>

          {/* Feature 5: AI Insights */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Safety Insights</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Intelligent processing evaluates recorded diary patterns, recurrent contexts, and suggests proactive precautions with zero crime-prediction claims.
            </p>
          </div>

          {/* Feature 6: AI Assistant */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>AI Safety Assistant</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Interactive 24/7 AI chat offering verified safety strategies, de-escalation tips, travel security advice, and immediate helplines.
            </p>
          </div>

          {/* Feature 7: Fake Call */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <PhoneCall size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fake Call Simulator</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Discreetly schedule a simulated incoming phone call from Mom, Dad, or Police with customizable delays to safely exit awkward situations.
            </p>
          </div>

          {/* Feature 8: Audio Recording */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Mic size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Audio Evidence Recording</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Capture clear audio evidence using high-fidelity MediaRecorder with live timer, in-browser playback, and local file export.
            </p>
          </div>

          {/* Feature 9: Helplines */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Phone size={24} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Emergency Helplines Directory</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Direct access to National Emergency (112), Women Helpline (181), Medical (108), and Childline with 1-tap dial action.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ padding: '5rem 1.5rem', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>Simple & Seamless</span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '3rem' }}>
            How SafeHer Protects You in 4 Steps
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', textAlign: 'left' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>01</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create Your Account</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Sign up securely with encrypted credentials in under 30 seconds.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>02</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add Trusted Contacts</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Set your primary responders to be notified the second emergency beacon triggers.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>03</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Use Daily Safety Tools</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Track journeys, log unsafe incidents in your private diary, and consult the AI assistant.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.75rem' }}>04</div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Instant SOS when in Danger</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                One tap dispatches live location and status alerts to contacts and emergency services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '3rem', border: '2px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
              <Lock size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Privacy & Data Security First
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Your data is strictly yours. We enforce bank-grade security and ethical data handling.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <strong>No Silent Tracking:</strong> Location access is only requested upon explicit user initiation.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <strong>Private Diary Encryption:</strong> Other users or unverified entities cannot access your entries.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <strong>Consent for AI:</strong> Information is only processed by the AI engine with your explicit permission.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                <strong>Secure Authentication:</strong> BCrypt password hashing and JWT role-based access control.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section style={{ padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <div className="card" style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '4rem 2rem',
          background: 'var(--primary-gradient)',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem' }}>
            Take Control of Your Safety Today
          </h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '550px', margin: '0 auto 2rem' }}>
            Join SafeHer and equip yourself with an intelligent personal safety system.
          </p>
          <Link 
            to="/register" 
            className="btn" 
            style={{ 
              background: 'white', 
              color: 'var(--primary)', 
              width: 'auto', 
              padding: '1rem 2.5rem', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

    </div>
  );
};
