package com.firealarm.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verification")
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String otp;
    private LocalDateTime expiryTime;
    private LocalDateTime lastSentTime;

    public OtpVerification() {
    }

    public OtpVerification(String email, String otp, LocalDateTime expiryTime, LocalDateTime lastSentTime) {
        this.email = email;
        this.otp = otp;
        this.expiryTime = expiryTime;
        this.lastSentTime = lastSentTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public LocalDateTime getLastSentTime() {
        return lastSentTime;
    }

    public void setLastSentTime(LocalDateTime lastSentTime) {
        this.lastSentTime = lastSentTime;
    }
}
