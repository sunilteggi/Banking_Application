import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('Starting App.js imports...');

let HomePage, UserLogin, UserRegister, AdminLogin, UserDashboard, AdminDashboard, Navbar;

try {
  HomePage = require('./components/HomePage').default;
  console.log('HomePage imported:', HomePage);
} catch (error) {
  console.error('Error importing HomePage:', error);
}

try {
  UserLogin = require('./components/UserLogin').default;
  console.log('UserLogin imported:', UserLogin);
} catch (error) {
  console.error('Error importing UserLogin:', error);
}

try {
  UserRegister = require('./components/UserRegister').default;
  console.log('UserRegister imported:', UserRegister);
} catch (error) {
  console.error('Error importing UserRegister:', error);
}

try {
  AdminLogin = require('./components/AdminLogin').default;
  console.log('AdminLogin imported:', AdminLogin);
} catch (error) {
  console.error('Error importing AdminLogin:', error);
}

try {
  UserDashboard = require('./components/UserDashboard').default;
  console.log('UserDashboard imported:', UserDashboard);
} catch (error) {
  console.error('Error importing UserDashboard:', error);
}

try {
  AdminDashboard = require('./components/AdminDashboard').default;
  console.log('AdminDashboard imported:', AdminDashboard);
} catch (error) {
  console.error('Error importing AdminDashboard:', error);
}

try {
  Navbar = require('./components/Navbar').default;
  console.log('Navbar imported:', Navbar);
} catch (error) {
  console.error('Error importing Navbar:', error);
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };

    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      {Navbar && <Navbar token={token} role={role} />}
      <Routes>
        <Route path="/" element={HomePage ? <HomePage /> : <div>HomePage not loaded</div>} />
        <Route 
          path="/user/login" 
          element={
            !token ? (UserLogin ? <UserLogin /> : <div>UserLogin not loaded</div>) : 
            role === 'USER' ? <Navigate to="/user/dashboard" replace /> : 
            <Navigate to="/admin/dashboard" replace />
          } 
        />
        <Route 
          path="/user/register" 
          element={
            !token ? (UserRegister ? <UserRegister /> : <div>UserRegister not loaded</div>) : 
            <Navigate to={role === 'USER' ? "/user/dashboard" : "/admin/dashboard"} replace />
          } 
        />
        <Route 
          path="/admin/login" 
          element={
            !token ? (AdminLogin ? <AdminLogin /> : <div>AdminLogin not loaded</div>) : 
            role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : 
            <Navigate to="/user/dashboard" replace />
          } 
        />
        <Route 
          path="/user/dashboard" 
          element={
            token && role === 'USER' ? (UserDashboard ? <UserDashboard /> : <div>UserDashboard not loaded</div>) : 
            <Navigate to="/user/login" replace />
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            token && role === 'ADMIN' ? (AdminDashboard ? <AdminDashboard /> : <div>AdminDashboard not loaded</div>) : 
            <Navigate to="/admin/login" replace />
          } 
        />
      </Routes>
    </Router> 
  );
}

export default App;