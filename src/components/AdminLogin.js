import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api'; 
import './AdminLogin.css'; 
import './Auth.css';
const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      if (location.state.username) {
        setFormData(prev => ({ ...prev, username: location.state.username }));
      }
   
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', formData);
      console.log('Login response:', response.data);
      
      const userRole = response.data.role || response.data.userRole || 'USER';
      console.log('User role from response:', userRole);
      
      if (userRole !== 'ADMIN' && formData.username !== 'admin') {
        console.log('Access denied - Role:', userRole, 'Username:', formData.username);
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      const finalRole = (formData.username === 'admin') ? 'ADMIN' : userRole;
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', finalRole);
      
      if (response.data.username) {
        localStorage.setItem('username', response.data.username);
      } else {
        localStorage.setItem('username', formData.username);
      }
      
      console.log('Admin login successful, stored role:', finalRole);
      console.log('Navigating to admin dashboard...');
      
      navigate('/admin/dashboard', { replace: true });
      
    } catch (error) {
      setLoading(false);
      console.error('Admin login error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 401) {
          setError('Invalid admin credentials');
        } else if (error.response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          // setError(`Admin login failed. Status: ${error.response.status}`);
          setError(`Admin login failed. Invalid Username or Password`);
        }
      } else if (error.request) {
        console.error('Network error:', error.request);
        setError('Network error. Please check your connection and try again.');
      } else {
        console.error('Unexpected error:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className={`admin-login-container ${loading ? 'loading' : ''}`}>
      <h2 className="admin-login-title">Admin Login</h2>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            name="username" 
            placeholder="Admin Username" 
            value={formData.username}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <input 
            type="password" 
            name="password" 
            placeholder="Admin Password" 
            value={formData.password}
            onChange={handleChange} 
            required 
            disabled={loading}
            className="form-input"
          />
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'Logging in...' : 'Admin Login'}
        </button>
      </form>
      
      <div className="admin-login-footer">
        <p>Not an admin?</p>
        <button 
          type="button"
          onClick={() => navigate('/user/login')}
          disabled={loading}
          className="link-button"
        >
          User Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;