
// import React, { useEffect, useState } from 'react';
// import apiClient from '../services/authService';

// const StudentAttemptedAssessments = ({ user }) => {
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user) fetchResults();
//   }, [user]);

//   const fetchResults = async () => {
//     try {
//       const res = await apiClient.get('/results');
//       const studentResults = res.data
//         .filter(r => r.userId === user.userId)
//         .sort((a, b) => new Date(a.attemptDate) - new Date(b.attemptDate)); // oldest first
//       setResults(studentResults);
//     } catch (err) {
//       console.error('Failed to fetch results:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getImprovementTag = (attempts, index) => {
//     if (index === 0) return ''; // First attempt → no comparison

//     const prev = attempts[index - 1];
//     const curr = attempts[index];
//     if (!prev || !curr) return '';

//     const diff = curr.score - prev.score;
//     if (diff > 0) return '✅ Improved';
//     if (diff < 0) return '🔻 Dropped';
//     return '➖ Same';
//   };

//   if (loading) return <p className="mt-4">Loading attempted assessments...</p>;

//   // Group by assessmentId
//   const grouped = results.reduce((acc, result) => {
//     const id = result.assessmentId;
//     if (!acc[id]) acc[id] = [];
//     acc[id].push(result);
//     return acc;
//   }, {});

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4">Your Attempted Assessments</h2>

//       {Object.keys(grouped).length === 0 ? (
//         <div className="alert alert-warning">You haven’t attempted any assessments yet.</div>
//       ) : (
//         Object.entries(grouped).map(([assessmentId, attempts]) => (
//           <div key={assessmentId} className="mb-4">
//             <h5 className="mb-2 text-primary fw-bold">
//               📘 {attempts[0].assessment?.title || 'Untitled Assessment'}
//             </h5>
//             <ul className="list-group">
//               {attempts.map((r, i) => {
//                 const percent = ((r.score / (r.assessment?.maxScore || 1)) * 100).toFixed(2);
//                 const tag = getImprovementTag(attempts, i);
//                 return (
//                   <li key={r.resultId} className="list-group-item d-flex justify-content-between">
//                     <div>
//                       <strong>Attempt {i + 1}</strong> — Score: {r.score}/{r.assessment?.maxScore} ({percent}%)
//                       <br />
//                       <small>Attempted on: {new Date(r.attemptDate).toLocaleString()}</small>
//                     </div>
//                     {tag && <span className="badge bg-info text-dark align-self-center">{tag}</span>}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default StudentAttemptedAssessments;

import React, { useEffect, useState } from 'react';
import apiClient from '../services/authService';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const StudentAttemptedAssessments = ({ user }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleChart, setVisibleChart] = useState(null);

  useEffect(() => {
    if (user) fetchResults();
  }, [user]);

  const fetchResults = async () => {
    try {
      const res = await apiClient.get('/results');
      const studentResults = res.data
        .filter(r => r.userId === user.userId)
        .sort((a, b) => new Date(a.attemptDate) - new Date(b.attemptDate));
      setResults(studentResults);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImprovementTag = (attempts, index) => {
    if (index === 0) return '';
    const prev = attempts[index - 1];
    const curr = attempts[index];
    const diff = curr.score - prev.score;
    if (diff > 0) return '✅ Improved';
    if (diff < 0) return '🔻 Dropped';
    return '➖ Same';
  };

  if (loading) return <p className="mt-4">Loading attempted assessments...</p>;

  const grouped = results.reduce((acc, result) => {
    const id = result.assessmentId;
    if (!acc[id]) acc[id] = [];
    acc[id].push(result);
    return acc;
  }, {});

  const renderChart = (attempts, title) => {
    const labels = attempts.map((_, i) => `Attempt ${i + 1}`);
    const data = attempts.map(a =>
      ((a.score / (a.assessment?.maxScore || 1)) * 100).toFixed(2)
    );

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Score (%)',
          data,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.3
        }
      ]
    };

    return (
      <div className="mt-3 mb-4">
        <h6 className="text-info fw-bold">📈 {title} - Score Trend</h6>
        <Line data={chartData} />
      </div>
    );
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Attempted Assessments</h2>

      {Object.keys(grouped).length === 0 ? (
        <div className="alert alert-warning">You haven’t attempted any assessments yet.</div>
      ) : (
        Object.entries(grouped).map(([assessmentId, attempts]) => (
          <div key={assessmentId} className="mb-5">
            <h5 className="mb-2 text-primary fw-bold">
              📘 {attempts[0].assessment?.title || 'Untitled Assessment'}
              <button
                className="btn btn-sm btn-outline-secondary ms-3"
                onClick={() => setVisibleChart(visibleChart === assessmentId ? null : assessmentId)}
              >
                📊 {visibleChart === assessmentId ? 'Hide Chart' : 'View Chart'}
              </button>
            </h5>

            <ul className="list-group">
              {attempts.map((r, i) => {
                const percent = ((r.score / (r.assessment?.maxScore || 1)) * 100).toFixed(2);
                const tag = getImprovementTag(attempts, i);
                return (
                  <li key={r.resultId} className="list-group-item d-flex justify-content-between">
                    <div>
                      <strong>Attempt {i + 1}</strong> — Score: {r.score}/{r.assessment?.maxScore} ({percent}%)
                      <br />
                      <small>Attempted on: {new Date(r.attemptDate).toLocaleString()}</small>
                    </div>
                    {tag && <span className="badge bg-info text-dark align-self-center">{tag}</span>}
                  </li>
                );
              })}
            </ul>

            {visibleChart === assessmentId && renderChart(attempts, attempts[0].assessment?.title || '')}
          </div>
        ))
      )}
    </div>
  );
};

export default StudentAttemptedAssessments;
