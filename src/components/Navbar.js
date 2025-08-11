import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ token, role, username }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/', { replace: true });
    console.log('User logged out successfully');
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <img src="/TitanBank.jpeg" alt="Titan Logo" className="logo" />
          </Link>
        </div>
        <ul className="nav-menu">
          {!isHomePage && (
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
          )}
          {!token && (
            <>
              <li className="nav-item">
                <Link to="/user/login" className="nav-link">User Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/user/register" className="nav-link">User Register</Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/login" className="nav-link">Admin Login</Link>
              </li>
            </>
          )}
          {token && role === 'USER' && (
            <li className="nav-item">
              <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
            </li>
          )}
          {token && role === 'ADMIN' && (
            <li className="nav-item">
              <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
            </li>
          )}
        </ul>
        {token && (
          <div className="nav-user">
            {username && (
              <span className="user-greeting"> Welcome, {username} </span>
            )}
            <button onClick={handleLogout} className="logout-btn" aria-label="Logout" >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;