import React from 'react';
import { Shield, Sparkles, Heart, Phone, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'var(--card-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-color)',
      padding: '3.5rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1250px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            <div style={{ background: 'var(--primary-gradient)', padding: '0.35rem', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={22} />
            </div>
            <span>Safe<span style={{ color: 'var(--primary)' }}>Her</span></span>
          </div>
          <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            Your Safety. Your Power. Your Support.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            SafeHer is an AI-powered comprehensive women safety platform integrating instant distress beacons, trusted responder networks, smart journeys, and private safety intelligence.
          </p>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Safety Tools</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><Link to="/ai-assistant" style={{ color: 'var(--text-muted)' }}>AI Safety Assistant</Link></li>
            <li><Link to="/location-share" style={{ color: 'var(--text-muted)' }}>Live Location Sharing</Link></li>
            <li><Link to="/journey" style={{ color: 'var(--text-muted)' }}>Smart Journey Tracker</Link></li>
            <li><Link to="/diary" style={{ color: 'var(--text-muted)' }}>Private Safety Diary</Link></li>
            <li><Link to="/fake-call" style={{ color: 'var(--text-muted)' }}>Fake Call Simulator</Link></li>
            <li><Link to="/audio-recording" style={{ color: 'var(--text-muted)' }}>Audio Evidence Recorder</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Emergency Services</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><a href="tel:112" style={{ color: '#ef4444', fontWeight: 600 }}>National Emergency: 112</a></li>
            <li><a href="tel:181" style={{ color: '#8b5cf6', fontWeight: 600 }}>Women Helpline: 181</a></li>
            <li><a href="tel:1091" style={{ color: 'var(--primary)', fontWeight: 600 }}>Women Police Unit: 1091</a></li>
            <li><a href="tel:108" style={{ color: '#10b981', fontWeight: 600 }}>Medical Ambulance: 108</a></li>
            <li><Link to="/emergency-services" style={{ color: 'var(--text-muted)' }}>Full Helpline Directory</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Privacy & Trust</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            All private diary logs, audio recordings, and location coordinates are protected with zero unauthorized background tracking.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
            <Lock size={13} /> 100% Privacy Protected
          </div>
        </div>
      </div>
      
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.25rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        © {new Date().getFullYear()} SafeHer – AI-Powered Women Safety Platform. All rights reserved.
      </div>
    </footer>
  );
};
