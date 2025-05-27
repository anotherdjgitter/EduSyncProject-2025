import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark">Welcome to EduSync</h1>
        <p className="lead text-muted">Your smart, secure, and scalable Learning Management System</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
          <Link to="/register" className="btn btn-outline-primary btn-lg">Register</Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="row text-center">
        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body py-4">
              <h5 className="card-title text-success">👩‍🏫 Instructor Tools</h5>
              <p className="card-text">
                Create and customize courses effortlessly. Manage assessments, upload materials, interact with students, and evaluate performance—all in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body py-4">
              <h5 className="card-title text-info">🎓 Student Portal</h5>
              <p className="card-text">
                Dive into interactive lessons, take quizzes and exams, view grades, and receive personalized feedback to accelerate your learning journey.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body py-4">
              <h5 className="card-title text-warning">📊 Real-Time Analytics</h5>
              <p className="card-text">
                Track student progress with live dashboards. Visualize trends, identify challenges early, and make data-driven decisions to improve outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-5 text-muted">
        <small>© {new Date().getFullYear()} EduSync. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default Home;
