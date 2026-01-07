import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Welcome.css';

const Welcome = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // If user is already logged in, redirect to home
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const features = [
        {
            icon: 'fa-solid fa-bolt',
            title: 'Lightning Fast',
            description: 'Create and access your notes instantly with our blazing fast interface.'
        },
        {
            icon: 'fa-solid fa-shield-halved',
            title: 'Secure & Private',
            description: 'Your notes are encrypted and safely stored. Only you can access them.'
        },
        {
            icon: 'fa-solid fa-cloud',
            title: 'Cloud Synced',
            description: 'Access your notes from anywhere, anytime. Always in sync.'
        },
        {
            icon: 'fa-solid fa-tags',
            title: 'Smart Tags',
            description: 'Organize your thoughts with powerful tagging and search.'
        }
    ];

    return (
        <div className="welcome-page">
            {/* Animated background */}
            <div className="welcome-bg">
                <div className="welcome-bg-gradient"></div>
                <div className="welcome-bg-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>
            </div>

            {/* Hero Section */}
            <section className="welcome-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <i className="fa-solid fa-sparkles"></i>
                        <span>Your thoughts, beautifully organized</span>
                    </div>

                    <h1 className="hero-title">
                        Capture ideas.
                        <span className="gradient-text"> Keep memories.</span>
                    </h1>

                    <p className="hero-subtitle">
                        iKeep is your personal note-taking companion. Simple, secure, and
                        beautifully designed to help you remember what matters most.
                    </p>

                    <div className="hero-actions">
                        <Link to="/Signup" className="btn-primary-glow">
                            <span>Get Started Free</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                        <Link to="/Login" className="btn-secondary-outline">
                            <span>Sign In</span>
                        </Link>
                    </div>

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Happy Users</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">1M+</span>
                            <span className="stat-label">Notes Created</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                    </div>
                </div>

                {/* Floating note card preview */}
                <div className="hero-visual">
                    <div className="floating-card card-1">
                        <div className="card-header">
                            <i className="fa-solid fa-note-sticky"></i>
                            <span>Meeting Notes</span>
                        </div>
                        <div className="card-body">
                            <p>Project kickoff tomorrow at 10am. Remember to prepare the presentation slides...</p>
                        </div>
                        <div className="card-tag">work</div>
                    </div>

                    <div className="floating-card card-2">
                        <div className="card-header">
                            <i className="fa-solid fa-lightbulb"></i>
                            <span>Ideas</span>
                        </div>
                        <div className="card-body">
                            <p>App feature: Add dark mode toggle and custom themes...</p>
                        </div>
                        <div className="card-tag">ideas</div>
                    </div>

                    <div className="floating-card card-3">
                        <div className="card-header">
                            <i className="fa-solid fa-heart"></i>
                            <span>Personal</span>
                        </div>
                        <div className="card-body">
                            <p>Birthday gift ideas for Mom: flowers, her favorite book...</p>
                        </div>
                        <div className="card-tag">personal</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="welcome-features">
                <div className="features-header">
                    <h2>Everything you need to stay organized</h2>
                    <p>Powerful features wrapped in a beautiful, intuitive interface.</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            className="feature-card"
                            key={index}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="feature-icon">
                                <i className={feature.icon}></i>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="welcome-cta">
                <div className="cta-content">
                    <h2>Ready to get started?</h2>
                    <p>Join thousands of users who trust iKeep for their notes.</p>
                    <Link to="/Signup" className="btn-primary-glow btn-large">
                        <span>Create Free Account</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="welcome-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <i className="fa-solid fa-book-bookmark"></i>
                        <span>iKeep</span>
                    </div>
                    <p>© 2026 iKeep. Crafted with <i className="fa-solid fa-heart"></i> for note lovers.</p>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;
