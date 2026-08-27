import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, LogOut, Phone, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-navbar" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Shield color="var(--primary)" />
        SafeHer
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Dashboard</Link>
            <Link to="/journey" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Journey</Link>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UserIcon size={18}/> Profile</Link>
            <Link to="/emergency-contacts" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={18}/> Contacts</Link>
            <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Settings size={18}/> Settings</Link>
            <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Hello, {user?.fullName}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <LogOut size={18}/> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', width: 'auto' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
