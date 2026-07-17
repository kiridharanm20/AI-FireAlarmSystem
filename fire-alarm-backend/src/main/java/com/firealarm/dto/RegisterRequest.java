package com.firealarm.dto;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String otp;

    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password, String otp) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.otp = otp;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
