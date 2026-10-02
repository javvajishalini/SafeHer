-- SafeHer Database Schema v1
-- PostgreSQL

-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    profile_image TEXT,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Contacts
CREATE TABLE emergency_contacts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    relationship VARCHAR(50),
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SOS Incidents
CREATE TABLE sos_incidents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    address TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    message TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Safety Diary Entries
CREATE TABLE safety_diary_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location_address TEXT,
    location_latitude DOUBLE PRECISION,
    location_longitude DOUBLE PRECISION,
    incident_date DATE,
    incident_time TIME,
    incident_type VARCHAR(50),
    risk_level VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Journeys
CREATE TABLE journeys (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    start_address TEXT,
    start_latitude DOUBLE PRECISION,
    start_longitude DOUBLE PRECISION,
    dest_address TEXT,
    dest_latitude DOUBLE PRECISION,
    dest_longitude DOUBLE PRECISION,
    journey_date DATE,
    planned_start_time TIME,
    expected_arrival_time TIME,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Incident Reports
CREATE TABLE incident_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location_address TEXT,
    location_latitude DOUBLE PRECISION,
    location_longitude DOUBLE PRECISION,
    incident_date DATE,
    incident_time TIME,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Analyses
CREATE TABLE ai_analyses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT,
    patterns TEXT,
    recommendations TEXT,
    disclaimer TEXT,
    entry_count INTEGER,
    ai_provider VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversations
CREATE TABLE ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Messages
CREATE TABLE ai_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200),
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    recipient VARCHAR(255),
    error_message TEXT,
    related_sos_id BIGINT REFERENCES sos_incidents(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

-- Safety Tips
CREATE TABLE safety_tips (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audio Recordings (metadata only - actual files stored on filesystem/cloud)
CREATE TABLE audio_recordings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    mime_type VARCHAR(50),
    sos_incident_id BIGINT REFERENCES sos_incidents(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_sos_incidents_user_id ON sos_incidents(user_id);
CREATE INDEX idx_sos_incidents_status ON sos_incidents(status);
CREATE INDEX idx_safety_diary_user_id ON safety_diary_entries(user_id);
CREATE INDEX idx_safety_diary_incident_date ON safety_diary_entries(incident_date);
CREATE INDEX idx_journeys_user_id ON journeys(user_id);
CREATE INDEX idx_journeys_status ON journeys(status);
CREATE INDEX idx_incident_reports_user_id ON incident_reports(user_id);
CREATE INDEX idx_incident_reports_status ON incident_reports(status);
CREATE INDEX idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_audio_recordings_user_id ON audio_recordings(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_users_email ON users(email);

-- Seed Safety Tips
INSERT INTO safety_tips (category, title, content, icon, display_order) VALUES
('PERSONAL', 'Trust Your Instincts', 'If a situation feels unsafe, trust your gut feeling and leave immediately. Your safety is more important than being polite.', 'shield', 1),
('PERSONAL', 'Stay Aware of Surroundings', 'Keep your head up and stay alert. Avoid using your phone while walking alone, especially at night.', 'eye', 2),
('PERSONAL', 'Share Your Location', 'Always share your live location with a trusted contact when traveling alone or meeting someone new.', 'map-pin', 3),
('PERSONAL', 'Walk With Confidence', 'Walk with purpose and confidence. Making eye contact and appearing aware can deter potential threats.', 'user-check', 4),
('TRAVEL', 'Verify Transportation', 'Always verify the license plate, driver name, and car model before getting into a ride-share vehicle.', 'car', 5),
('TRAVEL', 'Sit Behind the Driver', 'When taking a taxi or ride-share, sit in the back seat behind the driver for the safest position.', 'user', 6),
('TRAVEL', 'Share Trip Details', 'Share your trip details with a friend or family member, including the route and expected arrival time.', 'share-2', 7),
('TRAVEL', 'Avoid Isolated Routes', 'Stick to well-traveled, well-lit roads. Avoid shortcuts through isolated areas, especially at night.', 'map', 8),
('ONLINE', 'Protect Personal Information', 'Never share your home address, daily routine, or financial information with strangers online.', 'lock', 9),
('ONLINE', 'Meet in Public Places', 'If meeting someone from the internet for the first time, always choose a well-lit, public location.', 'map', 10),
('ONLINE', 'Use Strong Passwords', 'Use unique, strong passwords for each account and enable two-factor authentication where available.', 'key', 11),
('ONLINE', 'Be Careful With Photos', 'Be cautious about sharing photos that reveal your location, workplace, or daily routine on social media.', 'camera', 12),
('PUBLIC_TRANSPORT', 'Stay in Well-Lit Areas', 'While waiting for public transport, stay in well-lit areas with other people around.', 'sun', 13),
('PUBLIC_TRANSPORT', 'Know Emergency Exits', 'Familiarize yourself with emergency exits in buses, trains, and metro stations.', 'log-out', 14),
('PUBLIC_TRANSPORT', 'Avoid Empty Compartments', 'Avoid sitting in empty train compartments or buses, especially during late hours.', 'users', 15),
('PUBLIC_TRANSPORT', 'Keep Belongings Secure', 'Keep your bags and belongings in front of you and maintain awareness of your surroundings.', 'briefcase', 16),
('EMERGENCY', 'Save Emergency Numbers', 'Save important emergency numbers (Police: 100, Women Helpline: 1091, Ambulance: 108) in your speed dial.', 'phone', 17),
('EMERGENCY', 'Learn Basic Self-Defense', 'Consider taking a basic self-defense class to build confidence and learn protective techniques.', 'shield', 18),
('EMERGENCY', 'Carry Safety Tools', 'Consider carrying a personal safety alarm, pepper spray (where legal), or a whistle for emergencies.', 'bell', 19),
('EMERGENCY', 'Document Incidents', 'Always document any concerning incidents with dates, times, locations, and descriptions in your safety diary.', 'file-text', 20);
