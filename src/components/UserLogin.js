import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css'; 

const UserLogin = () => {
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
    const response = await axios.post('http://localhost:8080/api/auth/login', formData);
    
   
    let token, username, role;
    
    if (typeof response.data === 'string') {
      
      token = response.data;
      username = formData.username;
      role = 'USER'; // Default role
    } else {
      
      token = response.data.token;
      username = response.data.username || formData.username;
      
      let backendRole = response.data.role || 'ROLE_USER';
      if (backendRole.startsWith('ROLE_')) {
        role = backendRole.substring(5); // Remove 'ROLE_' prefix
      } else {
        role = backendRole;
      }
    }
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    
    
    console.log('Login successful:', { token: !!token, role, username });
    
   
    if (role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/user/dashboard', { replace: true });
    }
    
  } catch (error) {
    setLoading(false);
    
    if (error.response) {
      if (error.response.status === 401) {
        setError('Invalid username or password');
      } else if (error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Login failed. Invalid Username or Password.');
      }
    } else if (error.request) {
      setError('Network error. Please check your connection and try again.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  }
};

  return (
    <div className={`auth-container ${loading ? 'loading' : ''}`}>
      <h2 className="auth-title">Login</h2>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
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
            placeholder="Password" 
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {/* <div className="auth-footer">
        <p>Don't have an account?</p>
        <button 
          onClick={() => navigate('/user/register')}
          disabled={loading}
          className="link-button"
        >
          Register here
        </button>
      </div> */}
      <div className="auth-footer">
  <div className="register-prompt">
    <p>Don't have an account?</p>
    <button onClick={() => navigate('/user/register')} disabled={loading} className="link-button" >
      Register here
    </button>
  </div>
</div>
    </div>
  );
};

export default UserLogin;