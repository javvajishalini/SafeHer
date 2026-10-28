-- V3: Multi-Mode SOS Support
-- Supports: STANDARD, IN_JOURNEY, SILENT, OVERDUE
ALTER TABLE sos_incidents
    ADD COLUMN IF NOT EXISTS sos_type VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS journey_id BIGINT REFERENCES journeys(id);

CREATE INDEX IF NOT EXISTS idx_sos_incidents_type ON sos_incidents(sos_type);
CREATE INDEX IF NOT EXISTS idx_sos_incidents_journey ON sos_incidents(journey_id);
