import React, { useState } from 'react';
import { JourneyStatus, type Journey } from '../../services/journey.service';
import { LiveJourneyMap } from '../LiveJourneyMap';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  ShieldAlert, 
  CheckCircle, 
  ExternalLink, 
  Users, 
  Search, 
  Filter, 
  Calendar,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';

interface JourneyListProps {
  journeys: Journey[];
  onEdit: (j: Journey) => void;
  onStart: (id: number) => void;
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
}

export const JourneyList: React.FC<JourneyListProps> = ({ journeys, onEdit, onStart, onComplete, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedJourneyForModal, setSelectedJourneyForModal] = useState<Journey | null>(null);

  const getStatusStyle = (status: JourneyStatus) => {
    switch (status) {
      case JourneyStatus.PLANNED:
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case JourneyStatus.ACTIVE:
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case JourneyStatus.OVERDUE:
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: '1px solid #ef4444' };
      case JourneyStatus.COMPLETED:
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case JourneyStatus.CANCELLED:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
    }
  };

  // Filtered Journeys
  const filteredJourneys = journeys.filter((j) => {
    const matchesSearch =
      searchTerm === '' ||
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.startLocation?.address && j.startLocation.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.destination?.address && j.destination.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const matchesDate = !dateFilter || j.journeyDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div>
      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
        background: 'var(--card-bg)',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search journeys by title, start or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem', margin: 0 }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', margin: 0, padding: '0.6rem 1rem', cursor: 'pointer' }}
          >
            <option value="ALL">All Statuses</option>
            <option value={JourneyStatus.PLANNED}>Planned</option>
            <option value={JourneyStatus.ACTIVE}>Active</option>
            <option value={JourneyStatus.OVERDUE}>Overdue</option>
            <option value={JourneyStatus.COMPLETED}>Completed</option>
            <option value={JourneyStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={16} color="var(--text-muted)" />
          <input
            type="date"
            className="input-field"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ width: 'auto', margin: 0, padding: '0.55rem 0.85rem' }}
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '0 0.3rem' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Journeys List */}
      {filteredJourneys.length === 0 ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <Compass size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>No smart journeys match your criteria.</div>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Try clearing filters or schedule a new transit journey.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredJourneys.map((j) => {
            const statusStyle = getStatusStyle(j.status);
            const isOverdue = j.status === JourneyStatus.OVERDUE;
            const isActive = j.status === JourneyStatus.ACTIVE;

            return (
              <div
                key={j.id}
                className="card animate-slide-up"
                style={{
                  padding: '1.75rem',
                  border: isOverdue ? '2px solid #ef4444' : isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  boxShadow: isOverdue ? '0 8px 30px rgba(239, 68, 68, 0.2)' : '0 4px 15px rgba(0,0,0,0.04)',
                  borderRadius: '16px'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {j.title}
                      </h3>
                      {isOverdue && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 800 }}>
                          <ShieldAlert size={16} /> OVERDUE ALERT TRIGGERED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} /> {j.journeyDate} • Scheduled: {j.plannedStartTime} – {j.expectedArrivalTime}
                      {j.safetyBufferMinutes != null ? ` (+${j.safetyBufferMinutes}m buffer)` : ''}
                    </p>
                  </div>

                  <span style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    border: statusStyle.border,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    {isOverdue && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />}
                    {j.status}
                  </span>
                </div>

                {/* Route Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  padding: '1.1rem 1.25rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <MapPin size={18} color="var(--primary)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Starting Point</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{j.startLocation?.address || 'Current Location'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <Navigation size={18} color="#10b981" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Destination</span>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>{j.destination?.address || 'Designated Stop'}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Details & Emergency Guardians */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {j.emergencyContacts && j.emergencyContacts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={15} color="var(--primary)" />
                      <span>Guardians Watching: <strong>{j.emergencyContacts.map((c) => c.name).join(', ')}</strong></span>
                    </div>
                  )}

                  {j.lastLocationUrl && (
                    <a
                      href={j.lastLocationUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} /> Last GPS on Google Maps
                    </a>
                  )}

                  {/* View Interactive Route Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedJourneyForModal(j)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: 0
                    }}
                  >
                    <Compass size={15} /> View Live Route Map
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {j.status === JourneyStatus.PLANNED && (
                    <>
                      <button
                        onClick={() => onStart(j.id)}
                        className="btn btn-primary"
                        style={{ padding: '0.65rem 1.4rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                      >
                        <Navigation size={16} /> START JOURNEY NOW
                      </button>
                      <button
                        onClick={() => onEdit(j)}
                        className="btn"
                        style={{ padding: '0.65rem 1.1rem', width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 600 }}
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => onCancel(j.id)}
                        className="btn"
                        style={{ padding: '0.65rem 1rem', width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {(j.status === JourneyStatus.ACTIVE || j.status === JourneyStatus.OVERDUE) && (
                    <>
                      <button
                        onClick={() => onComplete(j.id)}
                        className="btn"
                        style={{ background: '#10b981', color: '#ffffff', padding: '0.65rem 1.4rem', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                      >
                        <CheckCircle size={16} /> Confirm Arrival
                      </button>
                      <button
                        onClick={() => onCancel(j.id)}
                        className="btn"
                        style={{ padding: '0.65rem 1rem', width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {j.status === JourneyStatus.COMPLETED && (
                    <span style={{ fontSize: '0.85rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                      <CheckCircle size={16} /> Safely Completed {j.completedAt ? `at ${new Date(j.completedAt).toLocaleTimeString()}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Route Modal */}
      {selectedJourneyForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="card animate-scale-up" style={{
            maxWidth: '750px',
            width: '100%',
            padding: '2rem',
            borderRadius: '20px',
            background: 'var(--card-bg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {selectedJourneyForModal.title}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedJourneyForModal.startLocation?.address} → {selectedJourneyForModal.destination?.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJourneyForModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <LiveJourneyMap
              startCoords={selectedJourneyForModal.startLocation?.latitude && selectedJourneyForModal.startLocation?.longitude ? [selectedJourneyForModal.startLocation.latitude, selectedJourneyForModal.startLocation.longitude] : undefined}
              destCoords={selectedJourneyForModal.destination?.latitude && selectedJourneyForModal.destination?.longitude ? [selectedJourneyForModal.destination.latitude, selectedJourneyForModal.destination.longitude] : undefined}
              currentCoords={selectedJourneyForModal.lastLatitude && selectedJourneyForModal.lastLongitude ? [selectedJourneyForModal.lastLatitude, selectedJourneyForModal.lastLongitude] : undefined}
              startAddress={selectedJourneyForModal.startLocation?.address}
              destAddress={selectedJourneyForModal.destination?.address}
              height="350px"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedJourneyForModal(null)}
                className="btn btn-primary"
                style={{ width: 'auto', padding: '0.65rem 1.75rem', fontWeight: 700 }}
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
