import React, { useEffect, useState } from 'react';
import { contactService } from '../services/contact.service';
import { useToast } from '../context/ToastContext';
import { ContactList } from '../components/ContactList';
import { Users, ShieldCheck, PhoneCall, Info } from 'lucide-react';

export const EmergencyContacts: React.FC = () => {
  const { error: toastError } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to load emergency contacts';
      const text = typeof msg === 'string' ? msg : 'Failed to load emergency contacts';
      setError(text);
      toastError(text);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.6rem', borderRadius: '12px' }}>
            <Users size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Emergency Contacts
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>
              Your trusted safety responders. These individuals are contacted immediately during emergency alerts.
            </p>
          </div>
        </div>

        {/* Informational Banner */}
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.06)', 
          border: '1px solid rgba(99, 102, 241, 0.2)', 
          borderRadius: '16px', 
          padding: '1rem 1.25rem', 
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <ShieldCheck size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
            <strong>How it works:</strong> In the event of an SOS activation, your <em>Priority #1</em> contact is alerted first via SMS and instant dispatch with your exact GPS location, followed by all remaining active contacts in order.
          </span>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
          <p>Loading your emergency contacts...</p>
        </div>
      ) : (
        <ContactList contacts={contacts} refresh={loadContacts} />
      )}
    </div>
  );
};
