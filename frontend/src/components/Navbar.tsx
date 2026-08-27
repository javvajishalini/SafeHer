import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: 'white', padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Shield color="var(--primary)" />
        SafeHer
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Hello, {user?.fullName}</span>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Dashboard</Link>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><UserIcon size={18}/> Profile</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <LogOut size={18}/> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '0.5rem' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
