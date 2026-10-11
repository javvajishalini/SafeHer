import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Phone, 
  Navigation, 
  BookOpen, 
  Sparkles, 
  Mic, 
  ShieldAlert, 
  Lightbulb, 
  MapPin, 
  Clock, 
  PhoneCall,
  Menu,
  X,
  FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-navbar" style={{ padding: '0.85rem 1.5rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
          <div style={{ background: 'var(--primary-gradient)', padding: '0.45rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} />
          </div>
          <span>Safe<span style={{ color: 'var(--primary)' }}>Her</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                style={{ 
                  color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/dashboard') ? 700 : 500,
                  fontSize: '0.92rem'
                }}
              >
                Dashboard
              </Link>

              <Link 
                to="/emergency-contacts" 
                style={{ 
                  color: isActive('/emergency-contacts') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/emergency-contacts') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Phone size={15} /> Contacts
              </Link>

              <Link 
                to="/ai-assistant" 
                style={{ 
                  color: isActive('/ai-assistant') ? '#8b5cf6' : 'var(--text-main)', 
                  fontWeight: isActive('/ai-assistant') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Sparkles size={15} color="#8b5cf6" /> AI Assistant
              </Link>

              <Link 
                to="/journey" 
                style={{ 
                  color: isActive('/journey') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/journey') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Navigation size={15} /> Journey
              </Link>

              <Link 
                to="/diary" 
                style={{ 
                  color: isActive('/diary') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/diary') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <BookOpen size={15} /> Diary
              </Link>

              <Link 
                to="/emergency-services" 
                style={{ 
                  color: isActive('/emergency-services') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/emergency-services') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <PhoneCall size={15} /> Helplines
              </Link>

              <Link 
                to="/safety-tips" 
                style={{ 
                  color: isActive('/safety-tips') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/safety-tips') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Lightbulb size={15} /> Tips
              </Link>

              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin/dashboard" 
                  style={{ 
                    color: '#ef4444', 
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <ShieldAlert size={15} /> Admin
                </Link>
              )}

              <div style={{ height: '18px', width: '1px', background: 'var(--border-color)', margin: '0 0.25rem' }}></div>

              <Link 
                to="/profile" 
                style={{ 
                  color: isActive('/profile') ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: isActive('/profile') ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <UserIcon size={16} /> {user?.fullName?.split(' ')[0] || 'Profile'}
              </Link>

              <button 
                onClick={handleLogout} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.3rem',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/landing" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>Features</Link>
              <Link to="/login" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>Login</Link>
              <Link 
                to="/register" 
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '0.5rem 1.4rem', fontSize: '0.9rem' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};
