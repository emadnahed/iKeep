import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const host = "http://localhost:5000";
  let history = useNavigate();
  const { showAlert } = props;

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const { password } = credentials;
    if (!password) return { level: 0, label: "" };

    let strength = 0;
    if (password.length >= 4) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: "Weak", class: "weak" };
    if (strength <= 3) return { level: 2, label: "Medium", class: "medium" };
    return { level: 3, label: "Strong", class: "strong" };
  }, [credentials.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${host}/api/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const json = await response.json();
      console.log(json);

      if (json.authToken) {
        localStorage.setItem("token", json.authToken);
        showAlert("Account created successfully!", "success");
        history("/");
      } else {
        showAlert(json.error || "Signup failed", "danger");
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

  const isFormValid =
    credentials.name.length > 0 &&
    credentials.email.length > 0 &&
    credentials.password.length >= 4 &&
    credentials.password === credentials.cpassword;

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
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start organizing your thoughts today</p>
          </div>

          {/* Signup Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={credentials.name}
                  onChange={onChange}
                  required
                />
                <i className="fas fa-user"></i>
              </div>
            </div>

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
                  placeholder="Create a password"
                  value={credentials.password}
                  onChange={onChange}
                  minLength={4}
                  required
                />
                <i className="fas fa-lock"></i>
              </div>
              {credentials.password && (
                <div className="password-strength">
                  {[1, 2, 3].map((bar) => (
                    <div
                      key={bar}
                      className={`strength-bar ${bar <= passwordStrength.level
                          ? `active ${passwordStrength.class}`
                          : ""
                        }`}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="cpassword">Confirm password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="cpassword"
                  name="cpassword"
                  placeholder="Confirm your password"
                  value={credentials.cpassword}
                  onChange={onChange}
                  required
                />
                <i className="fas fa-check-circle"></i>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/Login" className="auth-link">
                Sign in
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

export default Signup;