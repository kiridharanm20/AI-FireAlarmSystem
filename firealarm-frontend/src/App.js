import React, { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import axios from "axios";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const audioRef = useRef(null);

  // Initialize and check/play siren state globally from backend API
  useEffect(() => {
    // Reset siren state on backend on initial load / refresh
    const initSiren = async () => {
      try {
        await axios.put("http://localhost:8081/api/alarms/siren-status", { active: false, muted: false });
      } catch (err) {
        console.error("Failed to initialize backend siren status:", err);
      }
    };
    initSiren();

    const audio = new Audio("/siren.wav");
    audio.loop = true;
    audioRef.current = audio;

    const checkSiren = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/alarms/siren-status");
        const active = res.data.active === true;
        const muted = res.data.muted === true;

        if (active) {
          if (muted) {
            audio.muted = true;
          } else {
            audio.muted = false;
            if (audio.paused) {
              audio.play().catch(err => {
                console.log("Autoplay waiting for user gesture:", err.message);
              });
            }
          }
        } else {
          if (!audio.paused) {
            audio.pause();
          }
          audio.currentTime = 0;
        }
      } catch (err) {
        console.error("Failed to query backend siren status:", err);
      }
    };

    checkSiren();
    const interval = setInterval(checkSiren, 400); // Poll faster for high responsiveness

    return () => {
      clearInterval(interval);
      audio.pause();
    };
  }, []);

  // Autoplay bypass user gesture listener
  useEffect(() => {
    const handleInteraction = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/alarms/siren-status");
        const active = res.data.active === true;
        const muted = res.data.muted === true;
        
        if (active && !muted && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(e => {
            console.log("Failed to play on interaction gesture:", e.message);
          });
        }
      } catch (err) {
        console.error("Failed interaction check:", err);
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute role="USER">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;