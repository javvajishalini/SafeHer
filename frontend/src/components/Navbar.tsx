import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Shield, 
  User as UserIcon, 
  LogOut, 
  Phone, 
  Navigation, 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  Lightbulb, 
  PhoneCall,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    info('Logged out successfully.');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="safeher-navbar-wrapper">
      <nav className="safeher-navbar" aria-label="Main Navigation">
        <div className="navbar-container">
          
          {/* 1. Left: Brand Shield Logo & Name (Vertically Centered) */}
          <div className="navbar-brand-col">
            <Link to="/" className="navbar-brand-link" aria-label="SafeHer Home">
              <div className="navbar-brand-icon">
                <Shield size={22} />
              </div>
              <span className="navbar-brand-title">
                Safe<span className="brand-highlight">Her</span>
              </span>
            </Link>
          </div>

          {/* 2. Center: Core Navigation Links (Desktop/Tablet-Wide) */}
          {isAuthenticated ? (
            <div className="navbar-center-col desktop-only">
              <Link 
                to="/dashboard" 
                className={`navbar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </Link>

              <Link 
                to="/emergency-contacts" 
                className={`navbar-nav-item ${isActive('/emergency-contacts') ? 'active' : ''}`}
              >
                <Phone size={15} />
                <span>Contacts</span>
              </Link>

              <Link 
                to="/ai-assistant" 
                className={`navbar-nav-item ai-item ${isActive('/ai-assistant') ? 'active' : ''}`}
              >
                <Sparkles size={15} />
                <span>AI Assistant</span>
              </Link>

              <Link 
                to="/journey" 
                className={`navbar-nav-item ${isActive('/journey') ? 'active' : ''}`}
              >
                <Navigation size={15} />
                <span>Journey</span>
              </Link>

              <Link 
                to="/diary" 
                className={`navbar-nav-item ${isActive('/diary') ? 'active' : ''}`}
              >
                <BookOpen size={15} />
                <span>Diary</span>
              </Link>

              <Link 
                to="/emergency-services" 
                className={`navbar-nav-item ${isActive('/emergency-services') ? 'active' : ''}`}
              >
                <PhoneCall size={15} />
                <span>Helplines</span>
              </Link>

              <Link 
                to="/safety-tips" 
                className={`navbar-nav-item ${isActive('/safety-tips') ? 'active' : ''}`}
              >
                <Lightbulb size={15} />
                <span>Tips</span>
              </Link>

              {user?.role === 'ADMIN' && (
                <Link 
                  to="/admin/dashboard" 
                  className={`navbar-nav-item admin-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                >
                  <ShieldAlert size={15} />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="navbar-center-col desktop-only">
              <Link to="/landing" className={`navbar-nav-item ${isActive('/landing') ? 'active' : ''}`}>
                <span>Platform Overview</span>
              </Link>
              <Link to="/emergency-services" className={`navbar-nav-item ${isActive('/emergency-services') ? 'active' : ''}`}>
                <PhoneCall size={15} />
                <span>Emergency Helplines</span>
              </Link>
              <Link to="/safety-tips" className={`navbar-nav-item ${isActive('/safety-tips') ? 'active' : ''}`}>
                <Lightbulb size={15} />
                <span>Safety Guides</span>
              </Link>
            </div>
          )}

          {/* 3. Right: User Profile & Authentication Actions (Desktop) */}
          <div className="navbar-right-col desktop-only">
            {isAuthenticated ? (
              <div className="navbar-user-controls">
                <Link 
                  to="/profile" 
                  className={`navbar-user-badge ${isActive('/profile') ? 'active' : ''}`}
                  title="View Account Profile"
                >
                  <div className="user-avatar-circle">
                    <UserIcon size={16} />
                  </div>
                  <span className="user-name-text">
                    {user?.fullName?.split(' ')[0] || 'My Account'}
                  </span>
                </Link>

                <div className="navbar-divider" aria-hidden="true" />

                <button 
                  type="button"
                  onClick={handleLogout} 
                  className="navbar-logout-btn"
                  title="Sign out of SafeHer"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="navbar-guest-controls">
                <Link to="/login" className="navbar-login-link">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary navbar-register-btn">
                  Get Protected
                </Link>
              </div>
            )}
          </div>

          {/* Mobile / Tablet Hamburger Toggle */}
          <button 
            type="button"
            className="navbar-hamburger-btn mobile-only" 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* 4. Mobile / Tablet Collapsible Menu Drawer */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-drawer animate-slide-up" role="dialog" aria-modal="true">
            <div className="mobile-drawer-content">
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-header">
                    <div className="user-avatar-circle-lg">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="mobile-user-name">{user?.fullName || 'Protected User'}</div>
                      <div className="mobile-user-role">{user?.role || 'Verified Citizen'}</div>
                    </div>
                  </div>

                  <div className="mobile-nav-list">
                    <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/emergency-contacts" className={`mobile-nav-link ${isActive('/emergency-contacts') ? 'active' : ''}`}>
                      <Phone size={18} />
                      <span>Trusted Contacts</span>
                    </Link>
                    <Link to="/ai-assistant" className={`mobile-nav-link ai-link ${isActive('/ai-assistant') ? 'active' : ''}`}>
                      <Sparkles size={18} />
                      <span>AI Safety Assistant</span>
                    </Link>
                    <Link to="/journey" className={`mobile-nav-link ${isActive('/journey') ? 'active' : ''}`}>
                      <Navigation size={18} />
                      <span>Smart Journey Tracker</span>
                    </Link>
                    <Link to="/diary" className={`mobile-nav-link ${isActive('/diary') ? 'active' : ''}`}>
                      <BookOpen size={18} />
                      <span>Private Safety Diary</span>
                    </Link>
                    <Link to="/emergency-services" className={`mobile-nav-link ${isActive('/emergency-services') ? 'active' : ''}`}>
                      <PhoneCall size={18} />
                      <span>Emergency Helplines</span>
                    </Link>
                    <Link to="/safety-tips" className={`mobile-nav-link ${isActive('/safety-tips') ? 'active' : ''}`}>
                      <Lightbulb size={18} />
                      <span>Safety Guides & Tips</span>
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <Link to="/admin/dashboard" className={`mobile-nav-link admin-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                        <ShieldAlert size={18} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="mobile-drawer-divider" />

                    <Link to="/profile" className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}>
                      <UserIcon size={18} />
                      <span>Account Settings</span>
                    </Link>

                    <button 
                      type="button" 
                      onClick={handleLogout} 
                      className="mobile-nav-link mobile-logout-btn"
                    >
                      <LogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="mobile-nav-list">
                  <Link to="/landing" className="mobile-nav-link">
                    <span>Platform Overview</span>
                  </Link>
                  <Link to="/emergency-services" className="mobile-nav-link">
                    <PhoneCall size={18} />
                    <span>Emergency Helplines</span>
                  </Link>
                  <Link to="/safety-tips" className="mobile-nav-link">
                    <Lightbulb size={18} />
                    <span>Safety Guides</span>
                  </Link>
                  <div className="mobile-drawer-divider" />
                  <Link to="/login" className="btn btn-primary" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn" style={{ textAlign: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
