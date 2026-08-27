import React, { useState, useEffect } from 'react';
import { contactService } from '../services/contact.service';
import { useAuth } from '../context/AuthContext';

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
    priority: contact?.priority?.toString() || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Basic client validation
    if (!formData.name || !formData.phoneNumber || !formData.relationship || !formData.priority) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        relationship: formData.relationship,
        priority: Number(formData.priority)
      };
      if (contact) {
        await contactService.update(contact.id, payload);
      } else {
        await contactService.create(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{contact ? 'Edit Contact' : 'Add Contact'}</h3>
      {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Full Name *</label>
          <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label">Phone Number *</label>
          <input type="text" name="phoneNumber" className="input-field" value={formData.phoneNumber} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label className="input-label">Relationship *</label>
          <select name="relationship" className="input-field" value={formData.relationship} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Mother">Mother</option>
            <option value="Father">Father</option>
            <option value="Sister">Sister</option>
            <option value="Brother">Brother</option>
            <option value="Spouse">Spouse</option>
            <option value="Friend">Friend</option>
            <option value="Guardian">Guardian</option>
            <option value="Relative">Relative</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Priority (1 = highest) *</label>
          <input type="number" name="priority" className="input-field" min="1" value={formData.priority} onChange={handleChange} required />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (contact ? 'Saving...' : 'Creating...') : (contact ? 'Save' : 'Create')}
          </button>
          <button type="button" className="btn" onClick={onCancel} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
};
