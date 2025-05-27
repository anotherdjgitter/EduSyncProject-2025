

import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/authService';
import { UserContext } from '../context/UserContext';

const Courses = () => {
  const { user } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructorId: '',
    mediaUrl: ''
  });
  const [editCourse, setEditCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const isInstructor = user?.role?.toLowerCase() === 'instructor';

  const fetchEnrollments = async () => {
    if (user?.role?.toLowerCase() === 'student') {
      try {
        const res = await apiClient.get('/enrollments');
        const enrolled = res.data
          .filter(e => e.userId === user.userId)
          .map(e => e.courseId);
        setEnrolledCourseIds(enrolled);
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
      }
    }
  };

  useEffect(() => {
    if (user?.userId){
      fetchCourses();
      fetchEnrollments();

    } 
  }, [user]);

  useEffect(() => {
    if (user?.userId) {
      fetchCourses();
      if (user.role.toLowerCase() === 'student') {
        fetchEnrolledCourses();
      }
    }
  }, [user]);
  
  const fetchEnrolledCourses = async () => {
    try {
      const res = await apiClient.get('/enrollments/my');
      const enrolledIds = res.data.map(c => c.courseId);
      setEnrolledCourseIds(enrolledIds);
    } catch (err) {
      console.error('Failed to fetch enrolled courses:', err);
    }
  };

  useEffect(() => {
    if (isInstructor) {
      setNewCourse(prev => ({ ...prev, instructorId: user.userId }));
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses');
      const filtered = isInstructor
        ? res.data.filter(c => c.instructorId === user.userId)
        : res.data;
      setCourses(filtered);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditCourse({ ...editCourse, [e.target.name]: e.target.value });
  };

  const handleEditClick = (course) => {
    setEditCourse({ ...course });
    setShowModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/courses/${editCourse.courseId}`, editCourse);
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update course.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await apiClient.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete course.');
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await apiClient.post(
        '/enrollments',
        JSON.stringify(courseId), // send raw GUID as string
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setEnrolledCourseIds(prev => [...prev, courseId]);
      alert('Enrolled successfully!');
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Failed to enroll.');
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isInstructor || !newCourse.instructorId) {
      setSubmitError('Only instructors with a valid ID can create courses.');
      return;
    }

    try {
      await apiClient.post('/courses', newCourse);
      setNewCourse({ title: '', description: '', instructorId: user.userId, mediaUrl: '' });
      fetchCourses();
    } catch (err) {
      console.error('Create error:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create course.');
    }
  };

  if (loading) return <div className="text-center mt-4">Loading courses...</div>;

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold text-dark">🎓 Courses</h2>

      {isInstructor && (
        <div className="card mb-5 shadow-sm border-0 rounded-4">
          <div className="card-body">
            <h4 className="card-title mb-4 text-primary">➕ Add New Course</h4>
            {submitError && <div className="alert alert-danger">{submitError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={newCourse.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Media URL (Playlist)</label>
                <input
                  type="text"
                  name="mediaUrl"
                  className="form-control"
                  value={newCourse.mediaUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button className="btn btn-success">Create Course</button>
            </form>
          </div>
        </div>
      )}

      <h4 className="mb-4">📚 Available Courses</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      {courses.length === 0 ? (
        <div className="alert alert-info">No courses found.</div>
      ) : (
        <div className="row">
          {courses.map(course => (
            <div key={course.courseId} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-dark">{course.title}</h5>
                  <p className="card-text">{course.description}</p>
                  <p className="card-text text-muted">
                    <small>Instructor ID: {course.instructorId}</small>
                  </p>
                  <div className="mt-auto">
                    {course.mediaUrl && (
                      <a
                        href={course.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary w-100 mb-2"
                      >
                        🎥 View Playlist
                      </a>
                    )}
                    {/* {isInstructor && (
                      <>
                        <button
                          className="btn btn-warning w-100 mb-2"
                          onClick={() => handleEditClick(course)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger w-100"
                          onClick={() => handleDeleteCourse(course.courseId)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )} */}

                      {isInstructor ? (
                        <>
                          <button
                            className="btn btn-warning w-100 mb-2"
                            onClick={() => handleEditClick(course)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger w-100"
                            onClick={() => handleDeleteCourse(course.courseId)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
                        enrolledCourseIds.includes(course.courseId) ? (
                          <button className="btn btn-success w-100" disabled>
                            ✅ Enrolled
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-warning w-100"
                            onClick={() => handleEnroll(course.courseId)}
                          >
                            📥 Enroll Now
                          </button>
                        )
                      )}


                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editCourse && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <form onSubmit={handleUpdateCourse}>
                <div className="modal-header">
                  <h5 className="modal-title text-primary">Edit Course</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      name="title"
                      className="form-control"
                      value={editCourse.title}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={editCourse.description}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Media URL</label>
                    <input
                      name="mediaUrl"
                      className="form-control"
                      value={editCourse.mediaUrl}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;


