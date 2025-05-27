import React, { useEffect, useState, useContext, useRef } from 'react';
import apiClient from '../services/authService';
import Chart from 'chart.js/auto';
import { UserContext } from '../context/UserContext';

const InstructorCourseStudents = () => {
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [analytics, setAnalytics] = useState([]);
  const [error, setError] = useState('');
  const chartRefs = useRef({}); // Keep track of chart instances

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) fetchAnalytics(selectedCourseId);
  }, [selectedCourseId]);

  useEffect(() => {
    if (!analytics || analytics.length === 0) return;

    analytics.forEach((entry) => {
      const canvasId = `chart-${entry.studentId}-${entry.assessmentId}`;
      const ctx = document.getElementById(canvasId);
      if (!ctx || !entry.attempts?.length) return;

      // Destroy existing chart instance
      if (chartRefs.current[canvasId]) {
        chartRefs.current[canvasId].destroy();
      }

      // Create new chart
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: entry.attempts.map((_, i) => `Attempt ${i + 1}`),
          datasets: [{
            label: 'Score',
            data: entry.attempts.map(a => a.score),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });

      chartRefs.current[canvasId] = chart;
    });

    return () => {
      // Cleanup all charts on unmount/change
      Object.values(chartRefs.current).forEach(chart => chart.destroy());
    };
  }, [analytics]);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses');
      const instructorCourses = res.data.filter(c => c.instructorId === user.userId);
      setCourses(instructorCourses);
    } catch (err) {
      console.error('Error loading courses', err);
      setError('Failed to load courses.');
    }
  };

  const fetchAnalytics = async (courseId) => {
    try {
      const res = await apiClient.get(`/enrollments/analytics/${courseId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading analytics', err);
      setError('Failed to load student analytics.');
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold text-dark">📊 Enrolled Students & Analytics</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4">
        <label className="form-label fw-semibold">Select Course</label>
        <select
          className="form-select"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">-- Select a Course --</option>
          {courses.map(c => (
            <option key={c.courseId} value={c.courseId}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseId && analytics.length > 0 ? (
        analytics.map((entry) => (
          <div key={`${entry.studentId}-${entry.assessmentId}`} className="card mb-4 shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h5 className="card-title text-primary">{entry.student}</h5>
              <p><strong>Assessment:</strong> {entry.assessmentTitle}</p>
              <p><strong>Total Attempts:</strong> {entry.attempts.length}</p>
              <p><strong>Latest Score:</strong> {entry.attempts.at(-1).score}</p>

              <div style={{ height: '200px' }}>
                <canvas id={`chart-${entry.studentId}-${entry.assessmentId}`}></canvas>
              </div>
            </div>
          </div>
        ))
      ) : selectedCourseId && analytics.length === 0 ? (
        <div className="alert alert-info">No student data available for this course.</div>
      ) : null}
    </div>
  );
};

export default InstructorCourseStudents;
