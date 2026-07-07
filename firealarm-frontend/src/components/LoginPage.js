import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

function LoginPage() {

  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {

  e.preventDefault();

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

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/user");
    }

  } catch (error) {

    if (error.response) {
      alert(error.response.data);
    } else {
      alert("Cannot connect to server");
    }

  }
};

  return (

    <div className="login-container">

      <div className="login-card">

        <h1>🔥 Smart Fire Alarm System</h1>

        <h3>Login Portal</h3>

        <div className="role-selector">

          <button
            type="button"
            className={role === "ADMIN" ? "active" : ""}
            onClick={() => setRole("ADMIN")}
          >
            Admin
          </button>

          <button
            type="button"
            className={role === "USER" ? "active" : ""}
            onClick={() => setRole("USER")}
          >
            User
          </button>

        </div>

        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="login-btn"
          >
            Login as {role}
          </button>

        </form>

      </div>

    </div>

  );
}

export default LoginPage;