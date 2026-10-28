import React, { useEffect, useState } from 'react';
import type { CreateJourneyRequest } from '../../services/journey.service';
import { contactService } from '../../services/contact.service';
import { LiveJourneyMap } from '../LiveJourneyMap';
import { 
  Clock, 
  Shield, 
  Users, 
  MapPin, 
  Navigation, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Compass,
  ArrowRight
} from 'lucide-react';

interface JourneyFormProps {
  initialData?: CreateJourneyRequest;
  onSubmit: (data: CreateJourneyRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

interface ContactOption {
  id: number;
  name: string;
  relationship?: string;
  phoneNumber?: string;
  isActive: boolean;
}

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const JourneyForm: React.FC<JourneyFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<CreateJourneyRequest>(initialData || {
    title: '',
    startLocation: { address: '', latitude: undefined, longitude: undefined },
    destination: { address: '', latitude: undefined, longitude: undefined },
    journeyDate: new Date().toISOString().split('T')[0],
    plannedStartTime: '',
    expectedArrivalTime: '',
    description: '',
    safetyBufferMinutes: 10,
    emergencyContactIds: []
  });

  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>(initialData?.emergencyContactIds || []);
  const [error, setError] = useState('');
  const [acquiringGps, setAcquiringGps] = useState(false);

  // Address search state for destination
  const [searchQuery, setSearchQuery] = useState(initialData?.destination?.address || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto populate start time if blank
  useEffect(() => {
    if (!formData.plannedStartTime) {
      const now = new Date();
      const pad = (n: number) => n < 10 ? '0' + n : n;
      const curTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      
      // Default arrival: 30 minutes later
      const arr = new Date(now.getTime() + 30 * 60 * 1000);
      const arrTime = `${pad(arr.getHours())}:${pad(arr.getMinutes())}`;

      setFormData(prev => ({
        ...prev,
        plannedStartTime: curTime,
        expectedArrivalTime: arrTime
      }));
    }
  }, []);

  // Load Contacts
  useEffect(() => {
    contactService.getAll().then((data: ContactOption[]) => {
      const activeOnly = data.filter(c => c.isActive !== false);
      setContacts(activeOnly);
      if (!initialData || !initialData.emergencyContactIds || initialData.emergencyContactIds.length === 0) {
        setSelectedContactIds(activeOnly.map(c => c.id));
      }
    }).catch(() => {});
  }, [initialData]);

  // Geolocation for Starting Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setAcquiringGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept': 'application/json' }
          });
          const data = await resp.json();
          if (data && data.display_name) {
            address = data.display_name.split(',').slice(0, 3).join(',').trim();
          }
        } catch (e) {
          // quiet fallback
        }

        setFormData(prev => ({
          ...prev,
          startLocation: { address, latitude: lat, longitude: lng }
        }));
        setAcquiringGps(false);
      },
      (err) => {
        setError('Location permission denied or timed out. Please enter starting location manually.');
        setAcquiringGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Live Address Search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`, {
          headers: { 'Accept': 'application/json' }
        });
        const data = await resp.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        // quiet fallback
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectSuggestion = (s: AddressSuggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setSearchQuery(s.display_name);
    setShowSuggestions(false);
    setFormData(prev => ({
      ...prev,
      destination: { address: s.display_name, latitude: lat, longitude: lng }
    }));
  };

  // Map click destination selection
  const handleMapDestinationSelect = (lat: number, lng: number, address?: string) => {
    const finalAddress = address || `Destination (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    setSearchQuery(finalAddress);
    setFormData(prev => ({
      ...prev,
      destination: { address: finalAddress, latitude: lat, longitude: lng }
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'startAddress') {
      setFormData(prev => ({ ...prev, startLocation: { ...prev.startLocation, address: value } }));
    } else if (name === 'safetyBufferMinutes') {
      setFormData(prev => ({ ...prev, safetyBufferMinutes: parseInt(value, 10) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleContact = (id: number) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Calculate Duration
  let durationMins = 30;
  if (formData.plannedStartTime && formData.expectedArrivalTime) {
    const [sh, sm] = formData.plannedStartTime.split(':').map(Number);
    const [eh, em] = formData.expectedArrivalTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) durationMins = diff;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.startLocation.address) {
      setError('Please provide a starting location.');
      return;
    }

    if (!formData.destination.address) {
      setError('Please specify an intended destination.');
      return;
    }

    if (formData.plannedStartTime && formData.expectedArrivalTime) {
      if (formData.expectedArrivalTime <= formData.plannedStartTime) {
        setError('Expected arrival time must be after planned start time.');
        return;
      }
    }

    const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t;

    onSubmit({
      ...formData,
      plannedStartTime: formatTime(formData.plannedStartTime),
      expectedArrivalTime: formatTime(formData.expectedArrivalTime),
      emergencyContactIds: selectedContactIds,
      expectedDurationMinutes: durationMins
    });
  };

  const selectedContactNames = contacts
    .filter(c => selectedContactIds.includes(c.id))
    .map(c => c.name);

  return (
    <div className="card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 2rem', borderRadius: '18px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
          <Shield size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {initialData ? 'Edit Smart Journey' : 'Plan a Smart Journey'}
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Real-time GPS tracking, automated arrival countdown &amp; timeout safety alerts
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 700 }}>Journey Title *</label>
          <input
            type="text"
            name="title"
            required
            className="input-field"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Evening Commute to Home, Campus Transit"
          />
        </div>

        {/* Start Location */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="input-label" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={16} color="var(--primary)" /> Starting Point *
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={acquiringGps}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--primary)',
                borderRadius: '6px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Navigation size={13} /> {acquiringGps ? 'Locating...' : 'USE CURRENT LOCATION'}
            </button>
          </div>
          <input
            type="text"
            name="startAddress"
            required
            className="input-field"
            value={formData.startLocation.address}
            onChange={handleChange}
            placeholder="e.g. Office, G. Pulla Reddy Engineering College, Kurnool"
          />
        </div>

        {/* Destination with Search & Nominatim Autocomplete */}
        <div className="input-group" style={{ position: 'relative' }}>
          <label className="input-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Compass size={16} color="#ef4444" /> Destination *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              className="input-field"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFormData(prev => ({
                  ...prev,
                  destination: { address: e.target.value }
                }));
              }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Search address, landmark, or click on map..."
              style={{ paddingRight: '2.5rem' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 900,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              maxHeight: '220px',
              overflowY: 'auto',
              marginTop: '4px'
            }}>
              {suggestions.map((s) => (
                <div
                  key={s.place_id}
                  onClick={() => selectSuggestion(s)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.display_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Map Preview & Route Planning */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Interactive Route Map
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click anywhere on map to pin destination
            </span>
          </div>
          <LiveJourneyMap
            startCoords={formData.startLocation.latitude && formData.startLocation.longitude ? [formData.startLocation.latitude, formData.startLocation.longitude] : undefined}
            destCoords={formData.destination.latitude && formData.destination.longitude ? [formData.destination.latitude, formData.destination.longitude] : undefined}
            startAddress={formData.startLocation.address || 'Starting point'}
            destAddress={formData.destination.address || 'Destination'}
            interactive={true}
            onDestinationSelect={handleMapDestinationSelect}
            height="260px"
          />
        </div>

        {/* Schedule & Timing */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 700 }}>Journey Date *</label>
            <input
              type="date"
              name="journeyDate"
              required
              className="input-field"
              value={formData.journeyDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 700 }}>Planned Start Time *</label>
            <input
              type="time"
              name="plannedStartTime"
              required
              className="input-field"
              value={formData.plannedStartTime.substring(0, 5)}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 700 }}>Expected Arrival Time *</label>
            <input
              type="time"
              name="expectedArrivalTime"
              required
              className="input-field"
              value={formData.expectedArrivalTime.substring(0, 5)}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* SAFETY BUFFER SELECTOR */}
        <div className="input-group" style={{
          background: 'rgba(99, 102, 241, 0.05)',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          marginBottom: '1.5rem'
        }}>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, margin: 0 }}>
            <Clock size={18} color="var(--primary)" /> Safety Buffer Window (Grace Period)
          </label>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.3rem 0 0.75rem' }}>
            Grace period added to your travel time. Overdue family alerts only fire if you haven't arrived after this buffer expires.
          </p>
          <select
            name="safetyBufferMinutes"
            className="input-field"
            value={formData.safetyBufferMinutes ?? 10}
            onChange={handleChange}
            style={{ cursor: 'pointer', fontWeight: 600 }}
          >
            <option value={0}>0 minutes (Alert immediately at expected arrival time)</option>
            <option value={5}>5 minutes grace buffer</option>
            <option value={10}>10 minutes grace buffer (Recommended)</option>
            <option value={15}>15 minutes grace buffer</option>
            <option value={20}>20 minutes grace buffer</option>
            <option value={30}>30 minutes grace buffer</option>
          </select>
        </div>

        {/* EMERGENCY GUARDIANS CHECKBOX SELECTION */}
        <div className="input-group" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontWeight: 700 }}>
              <Users size={16} color="var(--primary)" /> Select Emergency Contacts to Monitor &amp; Alert
            </label>
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                <button type="button" onClick={() => setSelectedContactIds(contacts.map(c => c.id))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 600 }}>Select All</button>
                <span>•</span>
                <button type="button" onClick={() => setSelectedContactIds([])} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Clear</button>
              </div>
            )}
          </div>

          {contacts.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#b91c1c', padding: '0.85rem', background: '#fee2e2', borderRadius: '8px' }}>
              No emergency contacts found. Please add at least one trusted contact in Emergency Contacts before starting a journey.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.65rem' }}>
              {contacts.map((c) => {
                const isChecked = selectedContactIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      background: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                      border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleContact(c.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{c.name}</strong>
                      {c.relationship && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.3rem' }}>
                          ({c.relationship})
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* JOURNEY SUMMARY (Requirement 20) */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '2rem'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} color="#10b981" /> Journey Summary Preview
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>FROM</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formData.startLocation.address || 'Current Location'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TO</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formData.destination.address || 'Destination'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>EXPECTED DURATION</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{durationMins} minutes</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>SAFETY BUFFER</span>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>+{formData.safetyBufferMinutes ?? 10} minutes</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>GUARDIANS WATCHING</span>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {selectedContactNames.length > 0 ? selectedContactNames.join(', ') : 'None selected'}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              width: 'auto',
              padding: '0.85rem 1.5rem',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.85rem 2rem',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
            }}
          >
            {loading ? 'Saving Smart Journey...' : initialData ? 'Update Journey' : 'START SMART JOURNEY'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
