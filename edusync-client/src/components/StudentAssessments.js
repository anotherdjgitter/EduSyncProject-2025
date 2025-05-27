// src/components/StudentAssessments.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/authService';

const StudentAssessments = ({ user }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  // const fetchAssessments = async () => {
  //   try {
  //     const res = await apiClient.get('/assessments');
  //     const active = res.data.filter(a => a.isActive);
  //     setAssessments(active);
  //   } catch (err) {
  //     console.error('Error fetching assessments:', err);
  //     setError('Could not load assessments.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get('/assessments/student/enrolled');
      setAssessments(res.data || []);
    } catch (err) {
      console.error('Error fetching enrolled-course assessments:', err);
      setError('Could not load assessments.');
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) return <p className="mt-4">Loading assessments...</p>;
  if (error) return <div className="alert alert-danger mt-4">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Assessments</h2>

      {assessments.length === 0 ? (
        <div className="alert alert-info">No active assessments available.</div>
      ) : (
        <div className="row">
          {assessments.map(assessment => (
            <div key={assessment.assessmentId} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{assessment.title}</h5>
                  <p className="card-text">Course: {assessment.course?.title || 'Unknown'}</p>
                  <p className="card-text">Max Score: {assessment.maxScore}</p>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={() => navigate(`/student/assessments/${assessment.assessmentId}/attempt`)}
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssessments;
