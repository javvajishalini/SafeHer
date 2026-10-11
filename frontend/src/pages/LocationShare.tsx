import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  MapPin, 
  Share2, 
  Copy, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Navigation, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const LocationShare: React.FC = () => {
  const { success, error: toastError, info } = useToast();
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const acquireLocation = () => {
    setLoading(true);
    setError('');
    setCopied(false);

    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your current browser.';
      setError(msg);
      toastError(msg);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setTimestamp(new Date().toLocaleTimeString());
        setLoading(false);
        success(`GPS coordinates locked (accuracy: ±${Math.round(pos.coords.accuracy)}m).`);
      },
      (err) => {
        setLoading(false);
        let msg = 'Location request timed out. Please try again.';
        if (err.code === 1) {
          msg = 'Location access was denied. Please allow location permissions in your browser settings.';
        } else if (err.code === 2) {
          msg = 'Position unavailable. Please ensure GPS / Location Services are enabled on your device.';
        }
        setError(msg);
        toastError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const mapsUrl = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : '';
  const shareText = coords 
    ? `🚨 SafeHer Live Location Update:\nI am sharing my current location for safety.\n📍 Coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}\n🗺️ Map: ${mapsUrl}`
    : '';

  const handleCopy = () => {
    if (!mapsUrl) return;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    success("Google Maps live location link copied to clipboard.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!coords) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SafeHer Location',
          text: shareText,
          url: mapsUrl
        });
        info("Location shared successfully.");
      } catch (err) {
        // Fallback to copy if cancelled or unsupported
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.6rem', borderRadius: '12px' }}>
            <MapPin size={26} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Secure Location Sharing
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.35rem' }}>
          Acquire your high-accuracy GPS coordinates on-demand and share real-time Google Maps links with family or trusted friends.
        </p>
      </div>

      {/* Privacy Notice */}
      <div style={{ 
        background: 'rgba(16, 185, 129, 0.06)', 
        border: '1px solid rgba(16, 185, 129, 0.2)', 
        borderRadius: '14px', 
        padding: '1rem 1.25rem', 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.9rem'
      }}>
        <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
        <span>
          <strong>Privacy Guarantee:</strong> SafeHer never silently tracks your background location. Location is only queried when you explicitly press the button below.
        </span>
      </div>

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

      {/* Main Coordinate Card */}
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        {coords ? (
          <div>
            <span className="badge badge-success" style={{ marginBottom: '1rem' }}>
              GPS Location Locked • {timestamp}
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latitude</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {coords.lat.toFixed(6)}°
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Longitude</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {coords.lng.toFixed(6)}°
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.03)', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accuracy Radius</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                  ±{Math.round(coords.accuracy || 10)} meters
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button 
                onClick={handleShare} 
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '0.85rem 1.75rem', gap: '0.5rem' }}
              >
                <Share2 size={18} /> Share Live Location
              </button>

              <button 
                onClick={handleCopy} 
                className="btn" 
                style={{ width: 'auto', padding: '0.85rem 1.75rem', gap: '0.5rem', background: 'var(--card-bg)', border: 'var(--glass-border)' }}
              >
                {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Location Link'}
              </button>

              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn" 
                style={{ width: 'auto', padding: '0.85rem 1.75rem', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
              >
                <ExternalLink size={18} /> Open in Google Maps
              </a>

              <button 
                onClick={acquireLocation} 
                className="btn" 
                style={{ width: 'auto', padding: '0.85rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)' }}
                title="Refresh Coordinates"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Navigation size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Ready to Acquire Real-Time Location
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
              Click the button below to fetch high-precision GPS coordinates from your device.
            </p>

            <button 
              onClick={acquireLocation} 
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem', gap: '0.5rem', margin: '0 auto' }}
            >
              <Navigation size={20} />
              {loading ? 'Acquiring GPS Fix...' : 'Get My Current Location'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
