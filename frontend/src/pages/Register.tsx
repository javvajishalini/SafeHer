import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { success, error: toastError, warning } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      warning('Passwords do not match. Please verify your password confirmation.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      warning('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password
      });
      success('Account created successfully! Welcome to SafeHer.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data;
      let errorMsg = 'Failed to create account. Please try again.';
      if (typeof msg === 'string') {
        errorMsg = msg;
      } else if (msg?.error) {
        errorMsg = msg.error;
      } else if (msg?.message) {
        errorMsg = msg.message;
      }
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card animate-slide-up" style={{ padding: '2.5rem', maxWidth: '520px' }}>
        
        {/* Branding Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: 'var(--primary-gradient)', 
            color: 'white', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)',
            marginBottom: '1rem'
          }}>
            <Shield size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Create Your SafeHer Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Join a comprehensive, AI-powered personal safety network.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.12)', 
            color: '#ef4444', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            padding: '0.85rem 1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} /> Full Name *
            </label>
            <input 
              type="text" 
              name="fullName" 
              required 
              className="input-field" 
              placeholder="e.g. Jane Doe"
              value={formData.fullName} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} /> Email *
              </label>
              <input 
                type="email" 
                name="email" 
                required 
                className="input-field" 
                placeholder="jane@example.com"
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={15} /> Phone Number *
              </label>
              <input 
                type="tel" 
                name="phoneNumber" 
                required 
                className="input-field" 
                placeholder="+91 9876543210"
                value={formData.phoneNumber} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={15} /> Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  required 
                  className="input-field" 
                  placeholder="Min 6 characters"
                  value={formData.password} 
                  onChange={handleChange} 
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={15} /> Confirm Password *
              </label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                required 
                className="input-field" 
                placeholder="Repeat password"
                value={formData.confirmPassword} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1.05rem', gap: '0.5rem' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Already registered? <Link to="/login" style={{ fontWeight: 700 }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
};
