import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import './PrivateLayout.css'; // 💡 Include your CSS file here

const PrivateLayout = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="private-layout-container py-4">
      <div className="private-layout-card shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h4 className="text-primary mb-0">👋 Welcome, {user?.name || 'User'}</h4>
          <button className="btn btn-logout" onClick={handleLogout}>
            🔒 Logout
          </button>
        </div>
        <div className="private-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PrivateLayout;
