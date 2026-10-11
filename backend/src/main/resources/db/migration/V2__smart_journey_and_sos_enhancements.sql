-- V2: Smart Journey & SOS enhancements
-- Adds safety_buffer_minutes, expected_arrival_at, overdue_alert_sent to journeys
-- Adds last location tracking to journeys
-- Adds emergency_contact_ids to sos_incidents
-- Adds smart_journey_contacts join table
-- Adds notification enhancements

ALTER TABLE journeys
    ADD COLUMN IF NOT EXISTS safety_buffer_minutes    INTEGER,
    ADD COLUMN IF NOT EXISTS expected_arrival_at      TIMESTAMP,
    ADD COLUMN IF NOT EXISTS overdue_alert_sent       BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_latitude            DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS last_longitude           DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS last_location_update     TIMESTAMP;

-- Join table for journey → emergency contact selection
CREATE TABLE IF NOT EXISTS smart_journey_contacts (
    journey_id BIGINT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES emergency_contacts(id) ON DELETE CASCADE,
    PRIMARY KEY (journey_id, contact_id)
);

-- Add journey_id to notifications for journey-triggered alerts
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS related_journey_id BIGINT REFERENCES journeys(id);

-- Add contact_id to notifications so we know which contact was alerted
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS related_contact_id BIGINT REFERENCES emergency_contacts(id);

-- Add notification_type detail column
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS provider VARCHAR(50);

-- SOS: allow storing selected contact ids (store as comma separated for simplicity, join table below is better)
-- We instead create a proper join table for SOS → contacts
CREATE TABLE IF NOT EXISTS sos_incident_contacts (
    sos_id     BIGINT NOT NULL REFERENCES sos_incidents(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES emergency_contacts(id) ON DELETE CASCADE,
    PRIMARY KEY (sos_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_smart_journey_contacts_journey ON smart_journey_contacts(journey_id);
CREATE INDEX IF NOT EXISTS idx_sos_incident_contacts_sos ON sos_incident_contacts(sos_id);
CREATE INDEX IF NOT EXISTS idx_journeys_expected_arrival ON journeys(expected_arrival_at);
CREATE INDEX IF NOT EXISTS idx_journeys_overdue_check ON journeys(status, expected_arrival_at, overdue_alert_sent);
