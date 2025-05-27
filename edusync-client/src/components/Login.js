

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import apiClient from '../services/authService';
import { useUser } from '../context/UserContext';

const Login = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loginResponse = await login(email, password);
      const token = loginResponse.data.token;
      const user = loginResponse.data.user;

      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h2 className="mb-4 text-center text-dark fw-bold">Welcome Back</h2>
          <p className="text-center text-muted mb-4">Please login to your EduSync account</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control rounded-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control rounded-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="d-grid mt-4">
              <button type="submit" className="btn btn-primary btn-lg rounded-3">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
