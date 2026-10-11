import React from 'react';
import { Shield, Lock, PhoneCall, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="safeher-footer-wrapper" role="contentinfo">
      <div className="footer-container">
        
        {/* 4 Equal Columns Grid */}
        <div className="footer-grid">
          
          {/* Column 1 — About SafeHer */}
          <div className="footer-col">
            <div className="footer-brand-header">
              <div className="footer-logo-badge">
                <Shield size={20} />
              </div>
              <span className="footer-brand-title">
                Safe<span className="brand-highlight">Her</span>
              </span>
            </div>

            <p className="footer-tagline">
              Your Safety. Your Power. Your Support.
            </p>

            <p className="footer-description">
              A comprehensive women's safety platform combining real-time GPS distress beacons, automated smart journey guardians, and secure private safety tools.
            </p>
          </div>

          {/* Column 2 — Safety Tools */}
          <div className="footer-col">
            <h4 className="footer-heading">Safety Tools</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/ai-assistant" className="footer-link">AI Safety Assistant</Link>
              </li>
              <li>
                <Link to="/location-share" className="footer-link">Live Location Sharing</Link>
              </li>
              <li>
                <Link to="/journey" className="footer-link">Smart Journey Tracker</Link>
              </li>
              <li>
                <Link to="/diary" className="footer-link">Private Safety Diary</Link>
              </li>
              <li>
                <Link to="/fake-call" className="footer-link">Fake Call Simulator</Link>
              </li>
              <li>
                <Link to="/audio-recording" className="footer-link">Audio Evidence Recorder</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Emergency Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Emergency Services</h4>
            <ul className="footer-nav-list emergency-list">
              <li>
                <a href="tel:112" className="footer-link emergency-link danger" title="Call National Emergency">
                  <span className="helpline-label">National Emergency:</span>
                  <strong className="helpline-number">112</strong>
                </a>
              </li>
              <li>
                <a href="tel:181" className="footer-link emergency-link purple" title="Call Women Helpline">
                  <span className="helpline-label">Women Helpline:</span>
                  <strong className="helpline-number">181</strong>
                </a>
              </li>
              <li>
                <a href="tel:1091" className="footer-link emergency-link primary" title="Call Women Police Helpline">
                  <span className="helpline-label">Women Police Helpline:</span>
                  <strong className="helpline-number">1091</strong>
                </a>
              </li>
              <li>
                <a href="tel:108" className="footer-link emergency-link green" title="Call Medical Ambulance">
                  <span className="helpline-label">Medical Ambulance:</span>
                  <strong className="helpline-number">108</strong>
                </a>
              </li>
              <li style={{ marginTop: '0.4rem' }}>
                <Link to="/emergency-services" className="footer-link directory-link">
                  <span>Full Helpline Directory</span>
                  <ExternalLink size={13} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Privacy & Trust */}
          <div className="footer-col">
            <h4 className="footer-heading">Privacy & Trust</h4>
            <p className="footer-description" style={{ marginBottom: '1rem' }}>
              Your privacy is our utmost priority. Audio recordings, private diaries, and real-time GPS telemetry are strictly confidential and protected with zero unauthorized tracking.
            </p>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <Link to="/safety-tips" className="footer-link" style={{ textDecoration: 'underline', fontSize: '0.88rem' }}>
                Privacy Policy & Safety Guide
              </Link>
            </div>

            <div className="footer-security-badge" title="Cryptographically protected & secure telemetry">
              <ShieldCheck size={16} />
              <span>100% Privacy & Data Protected</span>
            </div>
          </div>

        </div>

        {/* Full-Width Centered Bottom Copyright */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright-text">
            © {new Date().getFullYear()} SafeHer – Empowering Women Safety. All rights reserved. Built with care for safety and dignity.
          </p>
        </div>

      </div>
    </footer>
  );
};
