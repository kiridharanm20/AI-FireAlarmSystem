import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Flame, ShieldAlert, Eye, EyeOff, Lock, User, Cpu } from "lucide-react";
import "./LoginPage.css";

function LoginPage() {
  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSandboxBtn, setShowSandboxBtn] = useState(false);

  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Initialize cached credentials if rememberMe was previously set
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUsername");
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  // Background Particle Animation using HTML5 Canvas
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
        // Warm flame colors
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
      // Draw background glow
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

  const triggerSandboxLogin = () => {
    setLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      const mockUser = {
        id: role === "ADMIN" ? 999 : 888,
        username: username || (role === "ADMIN" ? "admin" : "user"),
        role: role,
        token: "sandbox-jwt-mock-token-12345",
      };

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", mockUser.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      localStorage.setItem("user", JSON.stringify(mockUser));
      // Store flag indicating we are running in sandbox demo mode
      localStorage.setItem("sandboxMode", "true");

      setLoading(false);
      if (mockUser.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setShowSandboxBtn(false);

    try {
      const url =
        role === "ADMIN"
          ? "http://localhost:8081/api/auth/admin-login"
          : "http://localhost:8081/api/auth/user-login";

      const response = await axios.post(url, {
        username,
        password,
      });

      const user = response.data;

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.removeItem("sandboxMode"); // Real mode

      setLoading(false);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      if (error.response && error.response.status !== 500) {
        setErrorMessage(error.response.data || "Invalid login credentials.");
      } else {
        setErrorMessage("Cannot connect to local Spring Boot server (offline).");
        setShowSandboxBtn(true);
      }
    }
  };

  return (
    <div className="login-container">
      <canvas ref={canvasRef} className="login-canvas" />

      <div className="login-card-wrapper">
        <div className="login-glass-card">
          <div className="login-header">
            <div className="login-logo" style={{ animation: role === "USER" ? "none" : "" }}>
              <Flame size={32} />
            </div>
            <h1 className="login-title">FireGuard AI</h1>
            <p className="login-subtitle">Intelligent Fire Alarm Command Center</p>
          </div>

          {/* Slide Switch selector */}
          <div className="role-switch-container">
            <div className={`role-slider ${role === "USER" ? "user-active" : ""}`} />
            <button
              type="button"
              className={`role-switch-btn ${role === "ADMIN" ? "active" : ""}`}
              onClick={() => setRole("ADMIN")}
            >
              <Cpu size={16} /> Admin Portal
            </button>
            <button
              type="button"
              className={`role-switch-btn ${role === "USER" ? "active" : ""}`}
              onClick={() => setRole("USER")}
            >
              <User size={16} /> User Panel
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <span className="input-icon">
                <User size={18} />
              </span>
            </div>

            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`input-field ${role === "USER" ? "user-focus" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/*<div className="login-utilities">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className={`checkbox-custom ${role === "USER" ? "user-theme" : ""}`}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#forgot" className="forgot-link" onClick={() => alert("Contact System Admin to reset passwords.")}>
                Forgot Password?
              </a>
            </div>*/}

            <button
              type="submit"
              className={`submit-btn-glow ${role === "USER" ? "user-theme" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>Sign In as {role === "ADMIN" ? "Administrator" : "Standard User"}</>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="login-footer" style={{ marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
            >
              Register Here
            </span>
          </div>

          {errorMessage && (
            <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
              <ShieldAlert size={16} /> {errorMessage}
            </div>
          )}

          {showSandboxBtn && (
            <div className="demo-badge-banner">
              <span>Database or backend is currently offline.</span>
              <button
                type="button"
                className="sandbox-mode-btn"
                onClick={triggerSandboxLogin}
              >
                Launch Sandbox Mode (Interactive Demo)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;