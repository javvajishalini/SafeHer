import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Save, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Calendar,
  Lock
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Change Password state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  const { updateUserContext, logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await userService.updateProfile({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber
      });
      setProfile(updated);
      updateUserContext({ fullName: updated.fullName });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage('');
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }

    setPwSaving(true);
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwMessage('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwError(err.response?.data?.message || err.response?.data || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ WARNING: This will permanently delete your SafeHer account, emergency contacts, and private logs. Continue?")) return;
    try {
      await userService.deleteAccount();
      logout();
    } catch (err) {
      alert("Failed to delete account.");
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: '650px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
        <p>Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Profile Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        
        {/* Avatar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            background: 'var(--primary-gradient)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {profile?.fullName || 'User Profile'}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className="badge badge-primary">{profile?.role || 'USER'}</span>
              <span className="badge badge-success">Verified Active</span>
            </div>
          </div>
        </div>

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info Form */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={16} /> Email Address (Read Only)
            </label>
            <input 
              type="email" 
              value={profile?.email || ''} 
              readOnly 
              disabled 
              className="input-field" 
              style={{ opacity: 0.7, cursor: 'not-allowed' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} /> Full Name *
              </label>
              <input 
                type="text" 
                name="fullName" 
                value={profile?.fullName || ''} 
                onChange={handleChange} 
                required 
                className="input-field" 
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={16} /> Phone Number *
              </label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={profile?.phoneNumber || ''} 
                onChange={handleChange} 
                required 
                className="input-field" 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ width: 'auto', gap: '0.4rem', padding: '0.75rem 1.75rem' }}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} color="var(--primary)" /> Change Password
        </h3>

        {pwMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{pwMessage}</span>
          </div>
        )}

        {pwError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="input-group">
            <label className="input-label">Current Password *</label>
            <input 
              type="password" 
              className="input-field" 
              value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">New Password *</label>
              <input 
                type="password" 
                className="input-field" 
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm New Password *</label>
              <input 
                type="password" 
                className="input-field" 
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={pwSaving}
              style={{ width: 'auto', gap: '0.4rem', padding: '0.75rem 1.75rem' }}
            >
              <Key size={18} />
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.03)' }}>
        <h4 style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          Danger Zone
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Permanently delete your account and remove all personal emergency records from our database.
        </p>
        <button 
          onClick={handleDeleteAccount}
          className="btn" 
          style={{ width: 'auto', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', gap: '0.4rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Trash2 size={16} /> Delete SafeHer Account
        </button>
      </div>

    </div>
  );
};
