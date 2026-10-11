import React, { useState } from 'react';
import { contactService } from '../services/contact.service';
import { ContactForm } from './ContactForm';
import { 
  UserPlus, 
  Phone, 
  Mail, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Power, 
  UserCheck, 
  Heart,
  AlertCircle
} from 'lucide-react';

type Props = {
  contacts: any[];
  refresh: () => void;
};

export const ContactList: React.FC<Props> = ({ contacts, refresh }) => {
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your emergency contacts?`)) return;
    setLoading(true);
    try {
      await contactService.delete(id);
      refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to delete contact');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, current: boolean) => {
    setLoading(true);
    try {
      await contactService.toggleStatus(id, !current);
      refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to update contact status');
    } finally {
      setLoading(false);
    }
  };

  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);

  return (
    <div>
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.12)', 
          color: '#ef4444', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '1rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Your Safety Circle ({contacts.length})
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Contacts listed in priority order. When SOS is triggered, alerts go to active contacts first.
          </p>
        </div>

        {!showForm && (
          <button 
            className="btn btn-primary" 
            onClick={() => { setShowForm(true); setEditing(null); }}
            style={{ width: 'auto', gap: '0.5rem', padding: '0.65rem 1.4rem' }}
          >
            <UserPlus size={18} /> Add New Contact
          </button>
        )}
      </div>

      {/* Form Drawer / Card */}
      {showForm && (
        <div style={{ marginBottom: '2rem' }}>
          <ContactForm
            contact={editing}
            onSuccess={() => { setShowForm(false); setEditing(null); refresh(); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {/* Contacts List Grid */}
      {contacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Heart size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Emergency Contacts Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Add at least one close contact (family, friend, partner) so they can be alerted instantly whenever you need help.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => { setShowForm(true); setEditing(null); }}
            style={{ width: 'auto', margin: '0 auto', gap: '0.5rem' }}
          >
            <UserPlus size={18} /> Add Your First Contact
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {sortedContacts.map((c) => {
            const isPrimary = c.priority === 1;
            return (
              <div 
                key={c.id} 
                className="card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isPrimary ? '2px solid rgba(99, 102, 241, 0.5)' : undefined,
                  opacity: c.isActive ? 1 : 0.7
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ 
                        width: '46px', 
                        height: '46px', 
                        borderRadius: '14px', 
                        background: isPrimary ? 'var(--primary-gradient)' : 'rgba(99, 102, 241, 0.1)', 
                        color: isPrimary ? 'white' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                          {c.name}
                        </h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {c.relationship}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span className={`badge ${isPrimary ? 'badge-primary' : 'badge-warning'}`}>
                        {isPrimary ? 'Priority #1 (Primary)' : `Priority #${c.priority}`}
                      </span>
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Phone & Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                      <Phone size={16} color="var(--primary)" />
                      <a href={`tel:${c.phoneNumber}`} style={{ fontWeight: 600 }}>{c.phoneNumber}</a>
                    </div>
                    {c.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <Mail size={16} />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                  <a 
                    href={`tel:${c.phoneNumber}`} 
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      gap: '0.35rem'
                    }}
                  >
                    <Phone size={14} /> Call
                  </a>

                  <button 
                    onClick={() => { setEditing(c); setShowForm(true); }} 
                    disabled={loading} 
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      color: 'var(--primary)', 
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      gap: '0.35rem'
                    }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button 
                    onClick={() => toggleStatus(c.id, c.isActive)} 
                    disabled={loading} 
                    className="btn" 
                    style={{ 
                      flex: 1, 
                      background: c.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                      color: c.isActive ? '#ef4444' : '#10b981', 
                      border: `1px solid ${c.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      gap: '0.35rem'
                    }}
                    title={c.isActive ? 'Disable from receiving emergency alerts' : 'Enable to receive emergency alerts'}
                  >
                    <Power size={14} /> {c.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <button 
                    onClick={() => handleDelete(c.id, c.name)} 
                    disabled={loading} 
                    className="btn" 
                    style={{ 
                      width: 'auto',
                      padding: '0.5rem 0.75rem', 
                      background: 'transparent', 
                      color: '#ef4444', 
                      border: '1px solid rgba(239, 68, 68, 0.2)' 
                    }}
                    title="Delete contact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
