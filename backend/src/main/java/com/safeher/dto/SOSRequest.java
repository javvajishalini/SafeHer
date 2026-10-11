package com.safeher.dto;

import java.util.List;

public class SOSRequest {
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private String address;
    private String message;

    /** IDs of contacts the user wants to specifically alert. If null/empty, all active contacts are alerted. */
    private List<Long> emergencyContactIds;

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<Long> getEmergencyContactIds() { return emergencyContactIds; }
    public void setEmergencyContactIds(List<Long> emergencyContactIds) { this.emergencyContactIds = emergencyContactIds; }
}
