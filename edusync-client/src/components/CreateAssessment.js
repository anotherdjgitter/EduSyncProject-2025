import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/authService';
import './CreateAssessment.css'; // 💡 Include your custom styles

const CreateAssessment = ({ user }) => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    courseId: '',
    maxScore: 100,
    startDate: '',
    endDate: '',
    timeLimit: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        const res = await apiClient.get('/courses');
        const instructorCourses = res.data.filter(
          (course) => course.instructorId === user.userId
        );
        setCourses(instructorCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      }
    };

    if (user?.role === 'instructor') {
      fetchInstructorCourses();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const assessmentData = {
        ...form,
        timeLimit: form.timeLimit ? parseInt(form.timeLimit) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      await apiClient.post('/assessments', assessmentData);
      navigate('/instructor/assessments');
    } catch (err) {
      console.error('Error creating assessment:', err);
      setError(err.response?.data?.message || 'Failed to create assessment');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="mb-4 text-center text-primary">📝 Create New Assessment</h2>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-3">
                  <label className="form-label">Title:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Midterm Quiz"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course:</label>
                  <select
                    className="form-select"
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Max Score:</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxScore"
                    value={form.maxScore}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Time Limit (minutes):</label>
                  <input
                    type="number"
                    className="form-control"
                    name="timeLimit"
                    value={form.timeLimit}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Start Date:</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">End Date:</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="text-end">
                  <button type="submit" className="btn btn-success px-4">
                    ✅ Create Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
