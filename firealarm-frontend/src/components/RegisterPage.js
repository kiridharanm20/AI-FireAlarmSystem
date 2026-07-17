import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Flame, ShieldAlert, Eye, EyeOff, Lock, User, Mail, Shield, ShieldCheck, Check, X, ArrowLeft } from "lucide-react";
import "./RegisterPage.css";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Background Particle Animation (matched with LoginPage.js)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const particles = [];
    const particleCount = 40;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.size = Math.random() * 4 + 2;
        this.speedY = Math.random() * 1.5 + 0.8;
        const colors = [
          "rgba(255, 77, 77, 0.4)", // Red
          "rgba(255, 138, 0, 0.35)", // Orange
          "rgba(245, 158, 11, 0.3)",  // Amber
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.drift = Math.random() * 0.6 - 0.3;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.drift;
        this.alpha -= this.fadeSpeed;

        if (this.alpha <= 0 || this.y < 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace("rgba", "hsla").includes("hsla")
          ? this.color
          : this.color.replace(/[\d.]+\)$/g, `${this.alpha})`);
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      gradient.addColorStop(0, "#1e1b4b");
      gradient.addColorStop(1, "#090d16");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Real-time password criteria validation states
  const passwordRules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least 1 number", met: /\d/.test(password) },
    { label: "At least 1 special character (e.g. !@#$%^&*)", met: /[@$!%*?&#]/.test(password) }
  ];

  const allRulesMet = passwordRules.every((rule) => rule.met);

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(inputEmail);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter an email address first." });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: "error", text: "Please enter a valid email format." });
      return;
    }

    setSendingOtp(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:8081/api/auth/send-otp", { email });
      setSendingOtp(false);
      setOtpSent(true);
      setCooldown(60);
      setMessage({ type: "success", text: response.data.message || "OTP sent successfully." });
    } catch (error) {
      setSendingOtp(false);
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data || "Failed to send OTP.";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      setMessage({ type: "error", text: "Please enter the 6-digit OTP code." });
      return;
    }

    setVerifyingOtp(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:8081/api/auth/verify-otp", { email, otp });
      setVerifyingOtp(false);
      setOtpVerified(true);
      setMessage({ type: "success", text: response.data.message || "Email verified successfully." });
    } catch (error) {
      setVerifyingOtp(false);
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data || "OTP verification failed. Check code and try again.";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Please fill out all required fields." });
      return;
    }

    if (!otpVerified) {
      setMessage({ type: "error", text: "Please verify your email address using OTP first." });
      return;
    }

    if (!allRulesMet) {
      setMessage({ type: "error", text: "Password does not meet the security criteria." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setRegistering(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.post("http://localhost:8081/api/auth/register", {
        username,
        email,
        password
      });
      setRegistering(false);
      alert("Registration successful! You can now log in.");
      navigate("/");
    } catch (error) {
      setRegistering(false);
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data || "Registration failed. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  return (
    <div className="register-container">
      <canvas ref={canvasRef} className="register-canvas" />

      <div className="register-card-wrapper">
        <div className="register-glass-card">
          <div className="register-back-link" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back to Login
          </div>

          <div className="register-header">
            <div className="register-logo">
              <Flame size={32} />
            </div>
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Verify email & register for standard access</p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Username Input */}
            <div className="register-input-wrapper">
              <input
                type="text"
                placeholder="Username"
                className="register-input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={otpVerified}
                required
              />
              <span className="register-input-icon">
                <User size={18} />
              </span>
            </div>

            {/* Email & Send OTP group */}
            <div className="register-email-group">
              <div className="register-input-wrapper flex-grow">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="register-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent || otpVerified}
                  required
                />
                <span className="register-input-icon">
                  <Mail size={18} />
                </span>
              </div>
              <button
                type="button"
                className="register-otp-send-btn"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpVerified || !email || cooldown > 0}
              >
                {sendingOtp ? (
                  <div className="register-spinner-small" />
                ) : cooldown > 0 ? (
                  `Resend (${cooldown}s)`
                ) : otpSent ? (
                  <>Resend</>
                ) : (
                  <>Send OTP</>
                )}
              </button>
            </div>

            {/* OTP Verification Code input */}
            {otpSent && (
              <div className="register-email-group animate-scale-up">
                <div className="register-input-wrapper flex-grow">
                  <input
                    type="text"
                    placeholder="Enter 6-Digit OTP"
                    className="register-input-field verified-glow"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={otpVerified}
                    maxLength={6}
                    style={{ letterSpacing: otpVerified ? "0px" : "3px", textAlign: otpVerified ? "left" : "center" }}
                    required
                  />
                  <span className="register-input-icon">
                    <Shield size={18} />
                  </span>
                </div>
                <button
                  type="button"
                  className={`register-otp-verify-btn ${otpVerified ? "verified" : ""}`}
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otpVerified || !otp}
                >
                  {verifyingOtp ? (
                    <div className="register-spinner-small" />
                  ) : otpVerified ? (
                    <ShieldCheck size={16} />
                  ) : (
                    <>Verify OTP</>
                  )}
                </button>
              </div>
            )}

            {/* Password Input */}
            <div className="register-input-wrapper" style={{ marginBottom: "10px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="register-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!otpVerified}
                required
              />
              <span className="register-input-icon">
                <Lock size={18} />
              </span>
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!otpVerified}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Real-time Password Rules Checklist */}
            {otpVerified && password.length > 0 && (
              <div className="password-rules-checklist">
                {passwordRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className={`rule-item ${rule.met ? "met" : "unmet"}`}
                  >
                    {rule.met ? (
                      <Check size={14} className="rule-icon met" />
                    ) : (
                      <X size={14} className="rule-icon unmet" />
                    )}
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="register-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="register-input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!otpVerified}
                required
              />
              <span className="register-input-icon">
                <Lock size={18} />
              </span>
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!otpVerified}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Register submit button */}
            <button
              type="submit"
              className="register-submit-btn-glow"
              disabled={registering || !otpVerified || !allRulesMet}
            >
              {registering ? (
                <div className="register-spinner" />
              ) : (
                <>Register Account</>
              )}
            </button>
          </form>

          {/* Reset link if they need to change email */}
          {otpSent && !otpVerified && (
            <div style={{ marginTop: "16px", fontSize: "0.8rem" }}>
              Entered incorrect email?{" "}
              <span
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setCooldown(0);
                  setMessage({ type: "", text: "" });
                }}
                style={{ color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}
              >
                Reset Form
              </span>
            </div>
          )}

          {/* Messages */}
          {message.text && (
            <div
              className={`register-message ${message.type}`}
              style={{
                color: message.type === "success" ? "var(--success)" : message.type === "warning" ? "var(--warning)" : "var(--danger)",
                fontSize: "0.85rem",
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "center"
              }}
            >
              <ShieldAlert size={16} /> {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
