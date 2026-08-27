import React, { useEffect, useState } from 'react';
import { contactService } from '../services/contact.service';
import { ContactList } from '../components/ContactList';

export const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading contacts...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Emergency Contacts</h2>
      {error && <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
      <ContactList contacts={contacts} refresh={loadContacts} />
    </div>
  );
};
