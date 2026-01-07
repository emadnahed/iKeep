import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About iKeep</h1>
        <p>Your personal space for thoughts, ideas, and everything in between.</p>
      </div>
      <div className="about-content">
        <div className="about-section">
          <h2>What is iKeep?</h2>
          <p>iKeep is a simple and elegant note-taking application designed to help you capture what's on your mind. Whether it's a brilliant idea, a to-do list, or a personal journal, iKeep provides a beautiful and intuitive interface to organize your thoughts.</p>
        </div>
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>Our mission is to provide a seamless and enjoyable note-taking experience. We believe that technology should empower creativity and productivity, not get in the way. That's why we've focused on creating a clean, distraction-free environment for your notes.</p>
        </div>
        <div className="about-section">
          <h2>Features</h2>
          <ul>
            <li><i className="fas fa-check"></i> Simple and intuitive interface</li>
            <li><i className="fas fa-check"></i> Create, edit, and delete notes with ease</li>
            <li><i className="fas fa-check"></i> Organize your notes with tags</li>
            <li><i className="fas fa-check"></i> Securely access your notes from anywhere</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;