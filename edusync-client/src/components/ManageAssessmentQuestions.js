import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/authService';

const ManageAssessmentQuestions = () => {
  const { assessmentId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState('MCQ');
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [points, setPoints] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [assessmentId]);

  const fetchQuestions = async () => {
    try {
      const res = await apiClient.get(`/questions/assessment/${assessmentId}`);
      const processed = (res.data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
      }));
      setQuestions(processed);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setPoints(1);
    setType('MCQ');
    setEditingId(null);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleEdit = (question) => {
    setText(question.text || '');
    setType(question.type);
    setCorrectAnswer(question.correctAnswer || '');
    setPoints(question.points || 1);
    setOptions(Array.isArray(question.options) ? question.options : []);
    setEditingId(question.questionId);
  };

  const handleAddOrUpdate = async () => {
    if (!text.trim()) {
      alert("Question text is required.");
      return;
    }

    const payload = {
      assessmentId,
      type,
      text,
      correctAnswer,
      points: parseInt(points),
      optionsJson: type === 'MCQ' ? JSON.stringify(options.filter(opt => opt.trim())) : null
    };

    if (editingId) {
      payload.questionId = editingId;
    }

    try {
      if (editingId) {
        await apiClient.put(`/questions/${editingId}`, payload);
        await fetchQuestions();
      } else {
        const res = await apiClient.post('/questions', payload);
        setQuestions(prev => [
          ...prev,
          {
            ...res.data,
            options: Array.isArray(res.data.options)
              ? res.data.options
              : JSON.parse(res.data.optionsJson || '[]')
          }
        ]);
      }

      resetForm();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Error saving question');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/questions/${id}`);
      setQuestions(questions.filter(q => q.questionId !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading questions...</div>;

  return (
    <div className="container my-5">
      <div className="card shadow-lg p-4 mb-4 border-0 rounded-4">
        <h2 className="mb-4 text-primary">Manage Assessment Questions</h2>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Question Type</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="MCQ">Multiple Choice</option>
              <option value="TrueFalse">True/False</option>
              <option value="ShortAnswer">Short Answer</option>
            </select>
          </div>

          <div className="col-md-8">
            <label className="form-label fw-semibold">Question Text</label>
            <input
              type="text"
              className="form-control"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Points</label>
            <input
              type="number"
              className="form-control"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
            />
          </div>

          {type === 'MCQ' && (
            <>
              <div className="col-12">
                <label className="form-label fw-semibold">Options</label>
                {options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    className="form-control mb-2"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm mt-2"
                  onClick={() => setOptions([...options, ''])}
                >
                  ➕ Add Option
                </button>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Correct Option</label>
                <input
                  type="text"
                  className="form-control"
                  value={correctAnswer}
                  placeholder="Must match one of the options"
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                />
              </div>
            </>
          )}

          {type === 'TrueFalse' && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Correct Answer</label>
              <select
                className="form-select"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="">Select</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          )}

          {type === 'ShortAnswer' && (
            <div className="col-md-6">
              <label className="form-label fw-semibold">Expected Answer (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-4 d-flex flex-wrap gap-2">
          <button className="btn btn-success" onClick={handleAddOrUpdate}>
            {editingId ? '💾 Update Question' : '➕ Add Question'}
          </button>
          {editingId && (
            <button className="btn btn-outline-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card shadow p-4 border-0 rounded-4">
        <h4 className="mb-3 text-secondary">Existing Questions</h4>
        {questions.length === 0 ? (
          <p className="text-muted">No questions added yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {questions.map((q, index) => (
              <li
                key={q.questionId}
                className="list-group-item d-flex justify-content-between align-items-start px-0"
              >
                <div>
                  <strong>{index + 1}.</strong> {q.text} <span className="badge bg-primary ms-2">{q.type}</span>{' '}
                  <span className="badge bg-success ms-2">{q.points} pts</span>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(q)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(q.questionId)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageAssessmentQuestions;


// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import apiClient from '../services/authService';

// const ManageAssessmentQuestions = () => {
//   const { assessmentId } = useParams();

//   const [questions, setQuestions] = useState([]);
//   const [type, setType] = useState('MCQ');
//   const [text, setText] = useState('');
//   const [options, setOptions] = useState(['', '', '', '']);
//   const [correctAnswer, setCorrectAnswer] = useState('');
//   const [points, setPoints] = useState(1);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchQuestions();
//   }, [assessmentId]);

//   const fetchQuestions = async () => {
//     try {
//       const res = await apiClient.get(`/questions/assessment/${assessmentId}`);
//       const processed = (res.data || []).map(q => ({
//         ...q,
//         options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
//       }));
//       setQuestions(processed);
//     } catch (err) {
//       console.error('Failed to fetch questions:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setText('');
//     setOptions(['', '', '', '']);
//     setCorrectAnswer('');
//     setPoints(1);
//     setType('MCQ');
//     setEditingId(null);
//   };

//   const handleOptionChange = (index, value) => {
//     const updated = [...options];
//     updated[index] = value;
//     setOptions(updated);
//   };

//   const handleEdit = (question) => {
//     setText(question.text || '');
//     setType(question.type);
//     setCorrectAnswer(question.correctAnswer || '');
//     setPoints(question.points || 1);
//     setOptions(Array.isArray(question.options) ? question.options : []);
//     setEditingId(question.questionId);
//   };

//   const handleAddOrUpdate = async () => {
//     if (!text.trim()) {
//       alert("Question text is required.");
//       return;
//     }
  
//     const payload = {
//       assessmentId,
//       type,
//       text,
//       correctAnswer,
//       points: parseInt(points),
//       optionsJson: type === 'MCQ' ? JSON.stringify(options.filter(opt => opt.trim())) : null
//     };
  
//     // ✅ Include QuestionId for PUT
//     if (editingId) {
//       payload.questionId = editingId;
//     }
  
//     try {
//       if (editingId) {
//         await apiClient.put(`/questions/${editingId}`, payload);
//         await fetchQuestions();
//       } else {
//         const res = await apiClient.post('/questions', payload);
//         setQuestions(prev => [
//           ...prev,
//           {
//             ...res.data,
//             options: Array.isArray(res.data.options)
//               ? res.data.options
//               : JSON.parse(res.data.optionsJson || '[]')
//           }
//         ]);
//       }
  
//       resetForm();
//     } catch (err) {
//       console.error('Failed to save question:', err);
//       alert('Error saving question');
//     }
//   };
  
  

//   const handleDelete = async (id) => {
//     try {
//       await apiClient.delete(`/questions/${id}`);
//       setQuestions(questions.filter(q => q.questionId !== id));
//     } catch (err) {
//       console.error('Failed to delete question:', err);
//     }
//   };

//   if (loading) return <p>Loading questions...</p>;

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-4">Manage Questions</h2>

//       <div className="mb-3">
//         <label className="form-label">Question Type:</label>
//         <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
//           <option value="MCQ">Multiple Choice</option>
//           <option value="TrueFalse">True/False</option>
//           <option value="ShortAnswer">Short Answer</option>
//         </select>
//       </div>

//       <div className="mb-3">
//         <label className="form-label">Question Text:</label>
//         <input
//           type="text"
//           className="form-control"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />
//       </div>

//       <div className="mb-3">
//         <label className="form-label">Points:</label>
//         <input
//           type="number"
//           className="form-control"
//           value={points}
//           onChange={(e) => setPoints(e.target.value)}
//           min="1"
//         />
//       </div>

//       {type === 'MCQ' && (
//         <>
//           <div className="mb-3">
//             <label className="form-label">Options:</label>
//             {options.map((opt, i) => (
//               <input
//                 key={i}
//                 type="text"
//                 className="form-control mb-2"
//                 placeholder={`Option ${i + 1}`}
//                 value={opt}
//                 onChange={(e) => handleOptionChange(i, e.target.value)}
//               />
//             ))}
//             <button
//               type="button"
//               className="btn btn-sm btn-secondary"
//               onClick={() => setOptions([...options, ''])}
//             >
//               ➕ Add Option
//             </button>
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Correct Option:</label>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Must match one of the options exactly"
//               value={correctAnswer}
//               onChange={(e) => setCorrectAnswer(e.target.value)}
//             />
//           </div>
//         </>
//       )}

//       {type === 'TrueFalse' && (
//         <div className="mb-3">
//           <label className="form-label">Correct Answer:</label>
//           <select
//             className="form-select"
//             value={correctAnswer}
//             onChange={(e) => setCorrectAnswer(e.target.value)}
//           >
//             <option value="">Select</option>
//             <option value="True">True</option>
//             <option value="False">False</option>
//           </select>
//         </div>
//       )}

//       {type === 'ShortAnswer' && (
//         <div className="mb-3">
//           <label className="form-label">Expected Answer (Optional):</label>
//           <input
//             type="text"
//             className="form-control"
//             value={correctAnswer}
//             onChange={(e) => setCorrectAnswer(e.target.value)}
//           />
//         </div>
//       )}

//       <button className="btn btn-success mb-4" onClick={handleAddOrUpdate}>
//         {editingId ? '💾 Update Question' : '➕ Add Question'}
//       </button>

//       {editingId && (
//         <button className="btn btn-secondary ms-2 mb-4" onClick={resetForm}>
//           Cancel
//         </button>
//       )}

//       <hr />

//       <h4 className="mb-3">Existing Questions</h4>
//       {questions.length === 0 ? (
//         <p>No questions added yet.</p>
//       ) : (
//         <ul className="list-group">
//           {questions.map((q, index) => (
//             <li key={q.questionId} className="list-group-item d-flex justify-content-between align-items-center">
//               <div>
//                 {index + 1}. {q.text} ({q.type}) – {q.points} pts
//               </div>
//               <div>
//                 <button
//                   className="btn btn-sm btn-primary me-2"
//                   onClick={() => handleEdit(q)}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   className="btn btn-sm btn-danger"
//                   onClick={() => handleDelete(q.questionId)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ManageAssessmentQuestions;
