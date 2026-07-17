package com.firealarm.controller;

import com.firealarm.dto.LoginRequest;
import com.firealarm.dto.SendOtpRequest;
import com.firealarm.dto.VerifyOtpRequest;
import com.firealarm.dto.RegisterRequest;
import com.firealarm.entity.User;
import com.firealarm.entity.OtpVerification;
import com.firealarm.repository.UserRepository;
import com.firealarm.repository.OtpVerificationRepository;
import com.firealarm.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository repository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // In-memory verification state mapping verified emails to true
    private final Map<String, Boolean> emailVerifiedStatus = new ConcurrentHashMap<>();

    // Simple email validation regex helper
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }

    // Check password requirements and return a list of unmet criteria
    private List<String> getUnmetPasswordCriteria(String password) {
        List<String> unmet = new ArrayList<>();
        if (password == null || password.length() < 8) {
            unmet.add("Minimum 8 characters");
        }
        if (password == null || !password.matches(".*[A-Z].*")) {
            unmet.add("At least 1 uppercase letter");
        }
        if (password == null || !password.matches(".*[a-z].*")) {
            unmet.add("At least 1 lowercase letter");
        }
        if (password == null || !password.matches(".*\\d.*")) {
            unmet.add("At least 1 number");
        }
        if (password == null || !password.matches(".*[@$!%*?&#].*")) {
            unmet.add("At least 1 special character (e.g. !@#$%^&*)");
        }
        return unmet;
    }

    // Helper to check password (supports BCrypt & fallback plain-text for legacy users)
    private boolean checkPasswordAndUpgradeIfLegacy(User user, String rawPassword) {
        String storedPassword = user.getPassword();
        if (storedPassword == null) {
            return false;
        }
        
        boolean matches = false;
        // Check if the password starts with common BCrypt prefixes
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            matches = passwordEncoder.matches(rawPassword, storedPassword);
        } else {
            // Legacy plain text check
            matches = rawPassword.equals(storedPassword);
            if (matches) {
                // Auto-upgrade legacy user's password to BCrypt
                user.setPassword(passwordEncoder.encode(rawPassword));
                repository.save(user);
            }
        }
        return matches;
    }

    // Helper method to generate and save/send OTP
    private void generateAndSendOtp(String email) {
        // Generate a 6-digit numeric OTP code
        Random random = new Random();
        String otp = String.format("%06d", 100000 + random.nextInt(900000));

        // OTP expires in 5 minutes
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
        LocalDateTime lastSentTime = LocalDateTime.now();

        // Check if OTP record already exists for this email, update it
        Optional<OtpVerification> existingOtp = otpVerificationRepository.findByEmail(email);
        OtpVerification verificationRecord;
        if (existingOtp.isPresent()) {
            verificationRecord = existingOtp.get();
            verificationRecord.setOtp(otp);
            verificationRecord.setExpiryTime(expiryTime);
            verificationRecord.setLastSentTime(lastSentTime);
        } else {
            verificationRecord = new OtpVerification(email, otp, expiryTime, lastSentTime);
        }

        otpVerificationRepository.save(verificationRecord);
        emailService.sendOtpEmail(email, otp);
    }

    // ===========================
    // SEND OTP (Pre-Registration)
    // ===========================
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestBody SendOtpRequest request) {
        
        String email = request.getEmail();
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required."));
        }
        email = email.trim().toLowerCase();

        if (!isValidEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid email format."));
        }

        // Do not allow if email is already registered and verified
        User existingUser = repository.findByEmail(email);
        if (existingUser != null && existingUser.isVerified()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered."));
        }

        // Check resend rate limiting (max 1 resend per 60 seconds)
        Optional<OtpVerification> existingOtp = otpVerificationRepository.findByEmail(email);
        if (existingOtp.isPresent()) {
            OtpVerification details = existingOtp.get();
            long secondsSinceLastSend = ChronoUnit.SECONDS.between(details.getLastSentTime(), LocalDateTime.now());
            if (secondsSinceLastSend < 60) {
                long waitTime = 60 - secondsSinceLastSend;
                return ResponseEntity.status(429).body(Map.of("message", "Please wait " + waitTime + " seconds before requesting another code."));
            }
        }

        try {
            generateAndSendOtp(email);
            emailVerifiedStatus.put(email, false); // Reset verified state for this email
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send OTP email: " + e.getMessage()));
        }
    }

    // ===========================
    // VERIFY OTP (Pre-Registration)
    // ===========================
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        String email = request.getEmail();
        String otp = request.getOtp();

        if (email == null || otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP code are required."));
        }
        email = email.trim().toLowerCase();

        Optional<OtpVerification> optVerification = otpVerificationRepository.findByEmail(email);
        if (!optVerification.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No OTP request found for this email."));
        }

        OtpVerification details = optVerification.get();
        if (LocalDateTime.now().isAfter(details.getExpiryTime())) {
            otpVerificationRepository.deleteByEmail(email);
            return ResponseEntity.badRequest().body(Map.of("message", "OTP has expired. Please request a new one."));
        }

        if (!details.getOtp().equals(otp.trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP. Please enter the correct code."));
        }

        // Verification successful
        emailVerifiedStatus.put(email, true);
        otpVerificationRepository.deleteByEmail(email);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    // ===========================
    // REGISTER (Post-Verification)
    // ===========================
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        String username = request.getUsername();
        String email = request.getEmail();
        String password = request.getPassword();

        if (username == null || username.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields (username, email, password) are required.");
        }

        email = email.trim().toLowerCase();

        if (!isValidEmail(email)) {
            return ResponseEntity.badRequest().body("Invalid email format.");
        }

        // Check if verified
        Boolean isVerified = emailVerifiedStatus.get(email);
        if (isVerified == null || !isVerified) {
            return ResponseEntity.badRequest().body("Email not verified. Please verify your OTP first.");
        }

        // Validate password strength
        List<String> unmetCriteria = getUnmetPasswordCriteria(password);
        if (!unmetCriteria.isEmpty()) {
            return ResponseEntity.badRequest().body("Password validation failed: " + String.join(", ", unmetCriteria) + ".");
        }

        // Do not insert duplicate emails
        User existingUser = repository.findByEmail(email);
        if (existingUser != null && existingUser.isVerified()) {
            return ResponseEntity.badRequest().body("Email already registered.");
        }

        // Clean verification status
        emailVerifiedStatus.remove(email);

        // Encrypt passwords using BCryptPasswordEncoder
        String encryptedPassword = passwordEncoder.encode(password);

        User newUser;
        if (existingUser != null) {
            // Update the existing unverified user (if they registered previously but aborted)
            newUser = existingUser;
            newUser.setUsername(username);
            newUser.setPassword(encryptedPassword);
            newUser.setVerified(true);
        } else {
            newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPassword(encryptedPassword);
            newUser.setRole("USER"); // Default role
            newUser.setVerified(true); // Verified since they passed verification
        }

        User savedUser = repository.save(newUser);
        return ResponseEntity.ok(savedUser);
    }

    // ===========================
    // ADMIN LOGIN
    // ===========================
    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(
            @RequestBody LoginRequest request) {

        if (request == null || request.getUsername() == null || request.getPassword() == null ||
            request.getUsername().trim().isEmpty() || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(400).body("Username and password are required.");
        }

        User user = repository.findByUsername(request.getUsername().trim());

        if (user == null || !checkPasswordAndUpgradeIfLegacy(user, request.getPassword().trim())) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid username or password");
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity
                    .status(403)
                    .body("Only administrators can log in here.");
        }

        return ResponseEntity.ok(user);
    }

    // ===========================
    // USER LOGIN
    // ===========================
    @PostMapping("/user-login")
    public ResponseEntity<?> userLogin(
            @RequestBody LoginRequest request) {

        if (request == null || request.getUsername() == null || request.getPassword() == null ||
            request.getUsername().trim().isEmpty() || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.status(400).body("Username and password are required.");
        }

        User user = repository.findByUsername(request.getUsername().trim());

        if (user == null || !checkPasswordAndUpgradeIfLegacy(user, request.getPassword().trim())) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid username or password");
        }

        if (!"USER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity
                    .status(403)
                    .body("Please use the Admin Login page.");
        }

        // Do not allow login until email is verified
        if (!user.isVerified()) {
            return ResponseEntity
                    .status(403)
                    .body("Please verify your email address before logging in.");
        }

        return ResponseEntity.ok(user);
    }
}