package com.safeher.dto;

import jakarta.validation.constraints.NotNull;

public class ContactStatusRequest {
    @NotNull(message = "Status is required")
    private Boolean isActive;

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
