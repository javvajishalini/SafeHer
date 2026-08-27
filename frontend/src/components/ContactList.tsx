import React from 'react';
import { contactService } from '../services/contact.service';
import { ContactForm } from './ContactForm';
import { useAuth } from '../context/AuthContext';

type Props = {
  contacts: any[];
  refresh: () => void;
};

export const ContactList: React.FC<Props> = ({ contacts, refresh }) => {
  const { user } = useAuth();
  const [editing, setEditing] = React.useState<any>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    setLoading(true);
    try {
      await contactService.delete(id);
      refresh();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    setLoading(true);
    try {
      await contactService.toggleStatus(id, !current);
      refresh();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
      <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); }} style={{ marginBottom: '1rem' }}>
        + Add Contact
      </button>
      {showForm && (
        <ContactForm
          contact={editing}
          onSuccess={() => { setShowForm(false); refresh(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {contacts.length === 0 ? (
        <p>No emergency contacts added yet.</p>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {contacts.map(c => (
            <div key={c.id} className="card">
              <h4>{c.priority}. {c.name} {c.isActive ? '' : '(Inactive)'}</h4>
              <p><strong>Relationship:</strong> {c.relationship}</p>
              <p><strong>Phone:</strong> {c.phoneNumber}</p>
              {c.email && <p><strong>Email:</strong> {c.email}</p>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn btn-primary" onClick={() => { setEditing(c); setShowForm(true); }} disabled={loading}>Edit</button>
                <button className="btn" onClick={() => handleDelete(c.id)} disabled={loading}>Delete</button>
                <button className="btn" onClick={() => toggleStatus(c.id, c.isActive)} disabled={loading}>
                  {c.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
