import React, { useState } from 'react';
import { contactService } from '../services/contact.service';
import { useToast } from '../context/ToastContext';
import { User, Phone, Mail, Heart, AlertCircle, Save, X } from 'lucide-react';

type Props = {
  contact?: any; // undefined for create, object for edit
  onSuccess: () => void;
  onCancel: () => void;
};

export const ContactForm: React.FC<Props> = ({ contact, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    phoneNumber: contact?.phoneNumber || '',
    email: contact?.email || '',
    relationship: contact?.relationship || '',
    priority: contact?.priority?.toString() || '1'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error: toastError, warning } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.relationship) {
      const valMsg = 'Please fill all required fields (Name, Phone, and Relationship)';
      setError(valMsg);
      warning(valMsg);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        relationship: formData.relationship,
        priority: Number(formData.priority) || 1
      };
      if (contact) {
        await contactService.update(contact.id, payload);
        success(`Updated contact "${payload.name}" successfully.`);
      } else {
        await contactService.create(payload);
        success(`Added "${payload.name}" to your emergency contacts circle.`);
      }
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data;
      let errorMsg = 'Failed to save contact';
      if (typeof msg === 'string') errorMsg = msg;
      else if (msg?.message) errorMsg = msg.message;
      else if (msg?.error) errorMsg = msg.error;
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in" style={{ border: '2px solid rgba(99, 102, 241, 0.4)', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
          {contact ? '✏️ Edit Emergency Contact' : '➕ Add Emergency Contact'}
        </h3>
        <button 
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.12)', 
          color: '#ef4444', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '0.75rem 1rem', 
          borderRadius: '10px', 
          marginBottom: '1.25rem',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input 
              type="text" 
              name="name" 
              className="input-field" 
              placeholder="e.g. John Doe"
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Phone Number *</label>
            <input 
              type="tel" 
              name="phoneNumber" 
              className="input-field" 
              placeholder="e.g. +91 9876543210"
              value={formData.phoneNumber} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Relationship *</label>
            <select 
              name="relationship" 
              className="input-field" 
              value={formData.relationship} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Relationship</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Spouse">Spouse / Partner</option>
              <option value="Friend">Friend</option>
              <option value="Guardian">Guardian</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Priority Order (1 = First Responder) *</label>
            <select 
              name="priority" 
              className="input-field" 
              value={formData.priority} 
              onChange={handleChange} 
              required
            >
              <option value="1">1 - Primary (Notified 1st)</option>
              <option value="2">2 - Secondary</option>
              <option value="3">3 - Tertiary</option>
              <option value="4">4 - Backup</option>
              <option value="5">5 - Backup</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Email Address (Optional)</label>
          <input 
            type="email" 
            name="email" 
            className="input-field" 
            placeholder="e.g. contact@example.com"
            value={formData.email} 
            onChange={handleChange} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn" 
            onClick={onCancel} 
            disabled={loading}
            style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: 'auto', gap: '0.5rem', padding: '0.75rem 1.75rem' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : (contact ? 'Save Changes' : 'Add Contact')}
          </button>
        </div>
      </form>
    </div>
  );
};
