import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from "react-router-dom";
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  let location = useLocation();
  let navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/welcome');
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Add body class for navbar padding (always add since navbar is always visible)
  useEffect(() => {
    document.body.classList.add('has-navbar');
    return () => document.body.classList.remove('has-navbar');
  }, []);

  const isLoggedIn = localStorage.getItem('token');

  return (
    <nav className="navbar-premium">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand-premium">
          <i className="fas fa-sticky-note"></i>
          <span>iKeep</span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu */}
        <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          {/* Navigation Links */}
          <ul className="navbar-nav-premium">
            <li>
              <Link
                to="/"
                className={`nav-link-premium ${location.pathname === "/" ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`nav-link-premium ${location.pathname === "/about" ? "active" : ""}`}
              >
                About
              </Link>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="navbar-actions">
            {!isLoggedIn ? (
              <>
                <Link to="/Login" className="btn-navbar-ghost">
                  Login
                </Link>
                <Link to="/Signup" className="btn-navbar-primary">
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                className="btn-navbar-primary"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
