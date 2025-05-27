// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import apiClient from '../services/authService';

// const StudentAttemptAssessment = ({ user }) => {
//   const { assessmentId } = useParams();
//   const navigate = useNavigate();

//   const [assessment, setAssessment] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [score, setScore] = useState(null);

//   useEffect(() => {
//     fetchAssessment();
//     fetchQuestions();
//   }, [assessmentId]);

//   const fetchAssessment = async () => {
//     try {
//       const res = await apiClient.get(`/assessments/${assessmentId}`);
//       setAssessment(res.data);
//     } catch (err) {
//       console.error('Failed to fetch assessment', err);
//     }
//   };

//   const fetchQuestions = async () => {
//     try {
//       const res = await apiClient.get(`/questions/assessment/${assessmentId}`);
//       setQuestions(res.data);
//     } catch (err) {
//       console.error('Failed to fetch questions', err);
//     }
//   };

//   const handleChange = (questionId, value) => {
//     setAnswers(prev => ({ ...prev, [questionId]: value }));
//   };

//   const handleSubmit = async () => {
//     let total = 0;
//     questions.forEach(q => {
//       if (answers[q.questionId]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
//         total += q.points || 1;
//       }
//     });

//     const payload = {
//       assessmentId,
//       userId: user.userId,
//       score: total,
//       answers: JSON.stringify(answers),
//       isCompleted: true
//     };

//     try {
//       await apiClient.post('/results', payload);
//       setScore(total);
//       setSubmitted(true);
//     } catch (err) {
//       console.error('Error submitting result:', err);
//       alert('Error submitting assessment.');
//     }
//   };

//   if (!assessment || questions.length === 0) return <div className="container mt-4">Loading assessment...</div>;

//   return (
//     <div className="container mt-5 mb-5 p-4 rounded shadow bg-white">
//   <h2 className="mb-4 text-primary fw-bold">{assessment.title}</h2>

//   {!submitted ? (
//     <>
//       {questions.map(q => (
//         <div key={q.questionId} className="mb-4 p-3 border rounded bg-light">
//           <h5 className="fw-semibold">{q.text}</h5>

//           {q.type === 'MCQ' && JSON.parse(q.optionsJson || '[]').map((opt, i) => (
//             <div className="form-check" key={i}>
//               <input
//                 className="form-check-input"
//                 type="radio"
//                 name={q.questionId}
//                 value={opt}
//                 checked={answers[q.questionId] === opt}
//                 onChange={() => handleChange(q.questionId, opt)}
//               />
//               <label className="form-check-label">{opt}</label>
//             </div>
//           ))}

//           {q.type === 'TrueFalse' && ['True', 'False'].map(opt => (
//             <div className="form-check" key={opt}>
//               <input
//                 className="form-check-input"
//                 type="radio"
//                 name={q.questionId}
//                 value={opt}
//                 checked={answers[q.questionId] === opt}
//                 onChange={() => handleChange(q.questionId, opt)}
//               />
//               <label className="form-check-label">{opt}</label>
//             </div>
//           ))}

//           {q.type === 'ShortAnswer' && (
//             <input
//               type="text"
//               className="form-control mt-2"
//               placeholder="Your answer"
//               value={answers[q.questionId] || ''}
//               onChange={(e) => handleChange(q.questionId, e.target.value)}
//             />
//           )}
//         </div>
//       ))}

//       <button className="btn btn-success px-4" onClick={handleSubmit}>
//         ✅ Submit Assessment
//       </button>
//     </>
//   ) : (
//     <div className="alert alert-success">
//       <h4 className="fw-bold">🎉 Assessment Submitted!</h4>
//       <p className="mb-1">Your Score: <strong>{score} / {assessment.maxScore}</strong></p>
//       <p>Percentage: <strong>{((score / assessment.maxScore) * 100).toFixed(2)}%</strong></p>
//       <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/student/assessments')}>
//         🔙 Back to Assessments
//       </button>
//     </div>
//   )}
// </div>

//   );
// };

// export default StudentAttemptAssessment;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, replace } from 'react-router-dom';
import apiClient from '../services/authService';

const StudentAttemptAssessment = ({ user }) => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // in seconds

  useEffect(() => {
    fetchAssessment();
    fetchQuestions();
  }, [assessmentId]);

  useEffect(() => {
    let interval;
    if (timeLeft !== null && !submitted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmit(); // auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  const fetchAssessment = async () => {
    try {
      const res = await apiClient.get(`/assessments/${assessmentId}`);
      const a = res.data;
      setAssessment(a);

      if (a.timeLimit) {
        const totalSecs = a.timeLimit * 60;
        const startedAt = localStorage.getItem(`start-${assessmentId}`);
        const now = Date.now();

        if (!startedAt) {
          localStorage.setItem(`start-${assessmentId}`, now);
          setTimeLeft(totalSecs);
        } else {
          const elapsed = Math.floor((now - parseInt(startedAt)) / 1000);
          setTimeLeft(Math.max(totalSecs - elapsed, 0));
        }
      }
    } catch (err) {
      console.error('Failed to fetch assessment', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await apiClient.get(`/questions/assessment/${assessmentId}`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to fetch questions', err);
    }
  };

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    let total = 0;
    questions.forEach(q => {
      if (answers[q.questionId]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
        total += q.points || 1;
      }
    });

    const payload = {
      assessmentId,
      userId: user.userId,
      score: total,
      answers: JSON.stringify(answers),
      isCompleted: true
    };

    try {
      await apiClient.post('/results', payload);
      setScore(total);
      setSubmitted(true);
      localStorage.removeItem(`start-${assessmentId}`);
    } catch (err) {
      console.error('Error submitting result:', err);
      alert('Error submitting assessment.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!assessment || questions.length === 0) return <div className="container mt-4">Loading assessment...</div>;

  return (
    <div className="container mt-5 mb-5 p-4 rounded shadow bg-white">
      <h2 className="mb-4 text-primary fw-bold">{assessment.title}</h2>

      {assessment.timeLimit && !submitted && (
        <div className="alert alert-info">
          Time Remaining: <strong>{formatTime(timeLeft)}</strong>
        </div>
      )}

      {!submitted ? (
        <>
          {questions.map(q => (
            <div key={q.questionId} className="mb-4 p-3 border rounded bg-light">
              <h5 className="fw-semibold">{q.text}</h5>

              {q.type === 'MCQ' && JSON.parse(q.optionsJson || '[]').map((opt, i) => (
                <div className="form-check" key={i}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={q.questionId}
                    value={opt}
                    checked={answers[q.questionId] === opt}
                    onChange={() => handleChange(q.questionId, opt)}
                  />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}

              {q.type === 'TrueFalse' && ['True', 'False'].map(opt => (
                <div className="form-check" key={opt}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={q.questionId}
                    value={opt}
                    checked={answers[q.questionId] === opt}
                    onChange={() => handleChange(q.questionId, opt)}
                  />
                  <label className="form-check-label">{opt}</label>
                </div>
              ))}

              {q.type === 'ShortAnswer' && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Your answer"
                  value={answers[q.questionId] || ''}
                  onChange={(e) => handleChange(q.questionId, e.target.value)}
                />
              )}
            </div>
          ))}

          <button className="btn btn-success px-4" onClick={handleSubmit}>
            ✅ Submit Assessment
          </button>
        </>
      ) : (
        <div className="alert alert-success">
          <h4 className="fw-bold">🎉 Assessment Submitted!</h4>
          <p className="mb-1">Your Score: <strong>{score} / {assessment.maxScore}</strong></p>
          <p>Percentage: <strong>{((score / assessment.maxScore) * 100).toFixed(2)}%</strong></p>
          <button className="btn btn-outline-primary mt-3" onClick={() => navigate('/student/assessments', {replace : true})}>
            🔙 Back to Assessments
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentAttemptAssessment;
