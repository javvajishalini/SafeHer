package com.safeher.dto;

import jakarta.validation.constraints.NotNull;

/** Sent by the frontend every ~30 seconds while a Smart Journey is active */
public class JourneyLocationUpdateRequest {
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    private Double accuracy;

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }
}
