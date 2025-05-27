import React from 'react';
import { NavLink } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm rounded-3 px-4 py-2">
      <NavLink to="/" className="navbar-brand fw-bold text-primary fs-4">
        EduSync
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#publicNavbar"
        aria-controls="publicNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="publicNavbar">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'text-primary fw-semibold' : 'text-dark'}`
              }
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'text-primary fw-semibold' : 'text-dark'}`
              }
            >
              Login
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'text-primary fw-semibold' : 'text-dark'}`
              }
            >
              Register
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default PublicNavbar;
