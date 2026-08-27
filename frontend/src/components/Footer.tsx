import React from 'react';
import { Shield, MessageCircle, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            <Shield color="var(--primary)" size={32} />
            SafeHer
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Empowering and protecting women through smart journey registration, real-time tracking, and one-touch SOS response.
          </p>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>About Us</Link></li>
            <li><Link to="/features" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Features</Link></li>
            <li><Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>Connect With Us</h4>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} aria-label="Twitter">
              <MessageCircle size={20} />
            </a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} aria-label="Github">
              <Phone size={20} />
            </a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} aria-label="Email">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
      
      <div style={{
        borderTop: '1px solid rgba(229, 231, 235, 0.5)',
        paddingTop: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        © {new Date().getFullYear()} SafeHer. All rights reserved.
      </div>
    </footer>
  );
};
