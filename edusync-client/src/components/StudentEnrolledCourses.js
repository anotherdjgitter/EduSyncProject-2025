import React, { useEffect, useState, useContext } from 'react';
import apiClient from '../services/authService';
import { UserContext } from '../context/UserContext';

const StudentEnrolledCourses = () => {
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await apiClient.get('/enrollments/my');
      setCourses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📘 My Enrolled Courses</h2>
      {courses.length === 0 ? (
        <div className="alert alert-info">You haven’t enrolled in any courses yet.</div>
      ) : (
        <div className="row">
          {courses.map(course => (
            <div key={course.courseId} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <a
                    href={course.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary w-100"
                  >
                    🎥 View Playlist
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentEnrolledCourses;
