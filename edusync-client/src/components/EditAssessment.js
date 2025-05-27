// // src/components/EditAssessment.js
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import apiClient from '../services/authService';

// const EditAssessment = () => {
//   const { id } = useParams(); // assessmentId from URL
//   const navigate = useNavigate();

//   const [assessment, setAssessment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchAssessment = async () => {
//       try {
//         const res = await apiClient.get(`/assessments/${id}`);
//         setAssessment(res.data);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to load assessment');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAssessment();
//   }, [id]);

//   const handleChange = (e) => {
//     setAssessment({ ...assessment, [e.target.name]: e.target.value });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       await apiClient.put(`/assessments/${id}`, assessment);
//       navigate('/instructor/assessments');
//     } catch (err) {
//       console.error(err);
//       setError('Failed to update assessment');
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!assessment) return <p>Assessment not found</p>;

//   return (
//     <div className="container mt-4">
//       <h2>Edit Assessment</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <form onSubmit={handleUpdate}>
//         <div className="mb-3">
//           <label className="form-label">Title</label>
//           <input
//             name="title"
//             value={assessment.title}
//             onChange={handleChange}
//             className="form-control"
//           />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Max Score</label>
//           <input
//             name="maxScore"
//             type="number"
//             value={assessment.maxScore}
//             onChange={handleChange}
//             className="form-control"
//           />
//         </div>
//         <button className="btn btn-primary" type="submit">Update</button>
//       </form>
//     </div>
//   );
// };

// export default EditAssessment;

// src/components/EditAssessment.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/authService';

const EditAssessment = () => {
  const { id } = useParams(); // assessmentId
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessment();
    fetchCourses();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await apiClient.get(`/assessments/${id}`);
      setAssessment(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleChange = (e) => {
    setAssessment({ ...assessment, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    setAssessment({ ...assessment, [e.target.name]: e.target.checked });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/assessments/${id}`, {
        ...assessment,
        maxScore: parseInt(assessment.maxScore),
        timeLimit: assessment.timeLimit ? parseInt(assessment.timeLimit) : null
      });
      navigate('/instructor/assessments');
    } catch (err) {
      console.error(err);
      alert('Failed to update assessment');
    }
  };

//   const handleDelete = async (id) => {
//     const confirm = window.confirm("Are you sure you want to delete this assessment?");
//     if (!confirm) return;
  
//     try {
//       await apiClient.delete(`/assessments/${id}`);
//       navigate('/instructor/assessments');
//     } catch (err) {
//       console.error('Failed to delete assessment:', err);
//       alert('Error deleting assessment');
//     }
//   };
  

  if (loading || !assessment) return <p className="mt-4">Loading...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Edit Assessment</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            name="title"
            value={assessment.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Course</label>
          <select
            name="courseId"
            className="form-select"
            value={assessment.courseId}
            onChange={handleChange}
            required
          >
            <option value="">Select course</option>
            {courses.map(c => (
              <option key={c.courseId} value={c.courseId}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Max Score</label>
          <input
            name="maxScore"
            type="number"
            className="form-control"
            value={assessment.maxScore}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            name="startDate"
            type="datetime-local"
            className="form-control"
            value={assessment.startDate ? assessment.startDate.slice(0, 16) : ''}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            name="endDate"
            type="datetime-local"
            className="form-control"
            value={assessment.endDate ? assessment.endDate.slice(0, 16) : ''}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Time Limit (minutes)</label>
          <input
            name="timeLimit"
            type="number"
            className="form-control"
            value={assessment.timeLimit || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={assessment.isActive}
            onChange={handleCheckbox}
          />
          <label className="form-check-label" htmlFor="isActive">
            Is Active
          </label>
        </div>

        <button type="submit" className="btn btn-primary">Update Assessment</button>
      </form>
    </div>
  );
};

export default EditAssessment;
