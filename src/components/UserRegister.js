import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; 

const UserRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    console.log('Form data changed:', e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    console.log('Validating form:', formData);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|in|co\.in)$/;
    const email = "vishwa@gmail.com"; // example 

    if (emailRegex.test(email)) {
      console.log("Valid email");
    } else {
      console.log("Invalid email");
    }


    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    console.log('Form validation passed');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    setLoading(true);
    setError(null);

    
    if (!validateForm()) {
      console.log('Form validation failed');
      setLoading(false);
      return;
    }

    try {
  
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      console.log('Sending registration data:', registrationData);
      console.log('API URL:', 'http://localhost:8080/api/auth/register');

      const response = await axios.post('http://localhost:8080/api/auth/register', registrationData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('Registration successful:', response.data);
      console.log('Response status:', response.status);

      navigate('/user/login', {
        replace: true,
        state: {
          message: 'Registration successful! Please login with your credentials.',
          username: formData.username // Pass username to pre-fill login form
        }
      });

    } catch (error) {
      console.error('Registration error:', error);

      setLoading(false);

      if (error.response) {
        
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);

        if (error.response.status === 409) {
          setError('Username or email already exists. Please choose different credentials.');
        } else if (error.response.status === 400) {
          setError(error.response.data?.message || 'Invalid input. Please check your data.');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError(`Registration failed: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        
        console.error('Network error:', error.request);
        setError('Network error. Please check your connection and make sure the server is running.');
      } else {
        // Other error
        console.error('Unexpected error:', error.message);
        setError(`An unexpected error occurred: ${error.message}`);
      }
    }
  };

  return (
    <div className={`auth-container ${loading ? 'loading' : ''}`}>
      <h2 className="auth-title">Create Account</h2>

      {/* Debug info - remove in production
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
        <strong>Debug Info:</strong><br />
        Username: {formData.username}<br />
        Email: {formData.email}<br />
        Password Length: {formData.password.length}<br />
        Confirm Password Length: {formData.confirmPassword.length}<br />
        Loading: {loading.toString()}
      </div> */}

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
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
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
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      {/* <div className="auth-footer">
        <p>Already have an account?</p>
        <button 
          onClick={() => navigate('/user/login')}
          disabled={loading}
          className="link-button"
        >
          Login here
        </button>
      </div> */}
      <div className="auth-footer">
        <div className="register-prompt">
          <p>Already have an account?</p>
          <button onClick={() => navigate('/user/login')} disabled={loading} className="link-button" >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;