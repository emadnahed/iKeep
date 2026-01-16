import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Animated background */}
      <div className="about-bg">
        <div className="about-bg-gradient"></div>
        <div className="about-bg-orbs">
          <div className="about-orb about-orb-1"></div>
          <div className="about-orb about-orb-2"></div>
          <div className="about-orb about-orb-3"></div>
        </div>
      </div>

      <div className="about-header">
        <h1>About iKeep</h1>
        <p>Your personal space for thoughts, ideas, and everything in between.</p>
        <a href="/signup" className="cta-button">
          <span>Get Started Free</span>
          <i className="fa-solid fa-arrow-right"></i>
        </a>
      </div>

      <div className="about-content">
        <div className="about-section intro-section">
          <h2>What is iKeep?</h2>
          <p>iKeep is a simple and elegant note-taking application designed to help you capture what's on your mind. Whether it's a brilliant idea, a to-do list, or a personal journal, iKeep provides a beautiful and intuitive interface to organize your thoughts.</p>
        </div>

        <div className="about-section values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <h3>Simplicity</h3>
              <p>We believe in the power of simplicity. Our interface is clean and intuitive, so you can focus on what matters most: your ideas.</p>
            </div>
            <div className="value-item">
              <i className="fa-solid fa-shield-halved"></i>
              <h3>Security</h3>
              <p>Your privacy is our priority. We use the latest security measures to ensure that your notes are safe and secure.</p>
            </div>
            <div className="value-item">
              <i className="fa-solid fa-rocket"></i>
              <h3>Productivity</h3>
              <p>We're passionate about productivity. iKeep is designed to help you stay organized and get more done.</p>
            </div>
          </div>
        </div>

        <div className="about-section why-choose-us-section">
          <h2>Why Choose iKeep?</h2>
          <div className="why-choose-us-grid">
            <div className="why-choose-us-item">
              <i className="fa-solid fa-bolt"></i>
              <h3>Powerful & Flexible</h3>
              <p>Tailor your note-taking experience with customizable options and robust features designed for every need.</p>
            </div>
            <div className="why-choose-us-item">
              <i className="fa-solid fa-cloud"></i>
              <h3>Cloud Sync</h3>
              <p>Access your notes from any device, anywhere, with seamless cloud synchronization.</p>
            </div>
            <div className="why-choose-us-item">
              <i className="fa-solid fa-heart"></i>
              <h3>User-Friendly</h3>
              <p>Enjoy a beautiful, intuitive interface that makes note-taking a pleasure, not a chore.</p>
            </div>
          </div>
        </div>

        <div className="about-section testimonials-section">
          <h2>What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-item">
              <p>"iKeep has transformed the way I organize my thoughts. It's incredibly easy to use and beautifully designed!"</p>
              <span>— Sarah J., Freelancer</span>
            </div>
            <div className="testimonial-item">
              <p>"Finally, a note app that respects my privacy and helps me stay productive. Highly recommended!"</p>
              <span>— Mark T., Student</span>
            </div>
          </div>
        </div>

        <div className="about-section team-section">
          <h2>Meet the Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="https://i.pravatar.cc/150?img=1" alt="John Doe" />
              <h3>John Doe</h3>
              <p>Co-Founder & CEO</p>
            </div>
            <div className="team-member">
              <img src="https://i.pravatar.cc/150?img=2" alt="Jane Smith" />
              <h3>Jane Smith</h3>
              <p>Co-Founder & CTO</p>
            </div>
            <div className="team-member">
              <img src="https://i.pravatar.cc/150?img=3" alt="Peter Jones" />
              <h3>Peter Jones</h3>
              <p>Lead Designer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;