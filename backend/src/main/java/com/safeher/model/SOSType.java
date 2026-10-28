package com.safeher.model;

/**
 * Types of SOS Emergency Dispatches supported by SafeHer.
 */
public enum SOSType {
    STANDARD,      // One-Touch Emergency SOS Distress Beacon
    IN_JOURNEY,    // Transit / In-Journey Distress SOS (enriches alert with route, start & destination)
    SILENT,        // Stealth / Silent SOS without loud visual or acoustic indicators
    OVERDUE        // Automated Dead-Man's Switch SOS triggered by Journey arrival deadline expiry
}
