import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { IoMdClock } from "react-icons/io";


const Homepage = ({ token, role, username }) => {
  return (
    <div className="homepage">
     
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to Titan Bank
            </h1>
            <p className="hero-subtitle">
              Your financial hub: manage accounts, track transactions, and set goals. Open an Account Today
            </p>
            
            {!token ? (
              <div className="hero-actions">
                <Link to="/user/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/user/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <h2 className="welcome-back">
                  Welcome back, {username || 'User'}!
                </h2>
                {role === 'USER' && (
                  <Link to="/user/dashboard" className="btn btn-primary">
                    Go to Dashboard
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="btn btn-primary">
                    Go to Admin Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="hero-image">
            <div className="placeholder-image">
              {/* <div className="image-content">
                <h3>Your Journey Starts Here</h3>
                <p>Discover endless possibilities</p>
              </div> */}
     <div className="hero-image">
  <img src="/money.jpg" alt="Hero Image" />
</div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Why Choose Titan?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Fast & Reliable</h3>
              <p className="feature-description">
                Lightning-fast performance with 99.9% uptime guarantee.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure</h3>
              <p className="feature-description">
                Enterprise-grade security to keep your data safe and protected.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">
                Access your account anywhere, anytime from any device.
              </p>
            </div>
            
            <div className="feature-card">
            <div className="feature-icon">
            <IoMdClock size={32} color="#007bff" />
              </div>
               <h3 className="feature-title">24/7 Support</h3>
                <p className="feature-description">
                 Round-the-clock customer support to help you succeed.
              </p>
            </div>

          </div>
        </div>
      </section>

  
      {!token && (
        <section className="cta">
          <div className="cta-container">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">
              Join thousands of users who trust Titan for their daily needs.
            </p>
            <div className="cta-actions">
              <Link to="/user/register" className="btn btn-primary btn-large">
                Create Account
              </Link>
              <Link to="/user/login" className="btn btn-outline btn-large">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Titan Bank</h4>
              <p>Making your life easier, one click at a time.</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                {!token && <li><Link to="/user/register">Register</Link></li>}
                {!token && <li><Link to="/user/login">Login</Link></li>}
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 Titan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;