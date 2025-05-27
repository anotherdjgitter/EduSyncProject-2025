import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/authService';
import './InstructorAssessments.css'; // 💡 Custom styles

const InstructorAssessments = ({ user }) => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get('/assessments');
      const instructorAssessments = res.data.filter(
        a => a.course && a.course.instructorId === user.userId
      );
      setAssessments(instructorAssessments);
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
      setError('Failed to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.userId) {
      fetchAssessments();
    }
  }, [user]);

  const handleDelete = async (assessmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assessment?");
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/assessments/${assessmentId}`);
      setAssessments(prev => prev.filter(a => a.assessmentId !== assessmentId));
    } catch (err) {
      console.error('Failed to delete assessment:', err);
      alert('Error deleting assessment');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading assessments...</div>;
  if (error) return <div className="alert alert-danger mt-4">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📋 Your Assessments</h2>
        <Link to="/assessments/create" className="btn btn-success">
          ➕ Create Assessment
        </Link>
      </div>

      {assessments.length === 0 ? (
        <div className="alert alert-info">No assessments found.</div>
      ) : (
        <div className="row">
          {assessments.map(a => (
            <div key={a.assessmentId} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm assessment-card">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-primary">{a.title}</h5>
                  <p className="card-text"><strong>Max Score:</strong> {a.maxScore}</p>
                  <p className="card-text"><strong>Course:</strong> {a.course?.title || 'Unknown'}</p>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    <Link
                      to={`/instructor/assessments/edit/${a.assessmentId}`}
                      className="btn btn-outline-secondary btn-sm flex-grow-1"
                    >
                      ✏️ Edit
                    </Link>
                    <Link
                      to={`/instructor/assessments/${a.assessmentId}/manage`}
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                      📚 Manage Questions
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm flex-grow-1"
                      onClick={() => handleDelete(a.assessmentId)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorAssessments;
