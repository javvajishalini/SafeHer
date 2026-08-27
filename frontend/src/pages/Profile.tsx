import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { updateUserContext } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
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
      setError(err.response?.data || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>Your Profile</h2>
        {message && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{message}</div>}
        {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email (Read Only)</label>
            <input type="email" value={profile?.email} readOnly disabled className="input-field" style={{ background: '#F3F4F6' }} />
          </div>
          <div className="input-group">
            <label className="input-label">Role (Read Only)</label>
            <input type="text" value={profile?.role} readOnly disabled className="input-field" style={{ background: '#F3F4F6' }} />
          </div>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" name="fullName" value={profile?.fullName || ''} onChange={handleChange} required className="input-field" />
          </div>
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input type="text" name="phoneNumber" value={profile?.phoneNumber || ''} onChange={handleChange} required className="input-field" />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
