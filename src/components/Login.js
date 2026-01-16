import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const host = "http://localhost:5000";
  let history = useNavigate();
  const { showAlert } = props;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${host}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();
      console.log(json);
      
      if (json.success) {
        localStorage.setItem("token", json.authToken);
        showAlert("Logged in successfully", "success");
        history("/");
      } else {
        showAlert("Invalid credentials", "danger");
      }
    } catch (error) {
      showAlert("Something went wrong", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-bg-gradient"></div>
        <div className="auth-bg-orbs">
          <div className="auth-orb auth-orb-1"></div>
          <div className="auth-orb auth-orb-2"></div>
          <div className="auth-orb auth-orb-3"></div>
        </div>
      </div>

      {/* Auth Container */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <Link to="/welcome" className="auth-logo">
              <i className="fas fa-sticky-note"></i>
              <span>iKeep</span>
            </Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to continue to your notes</p>
          </div>

          {/* Login Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={onChange}
                  required
                />
                <i className="fas fa-envelope"></i>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={onChange}
                  required
                />
                <i className="fas fa-lock"></i>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading || !credentials.email || !credentials.password}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/Signup" className="auth-link">
                Create one
              </Link>
            </p>
            <Link to="/welcome" className="auth-back">
              <i className="fas fa-arrow-left"></i>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
