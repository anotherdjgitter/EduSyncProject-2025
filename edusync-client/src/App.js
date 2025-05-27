// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Home from './components/Home';
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard'; // Import Dashboard
// import Navigation from './components/Navigation';
// import { getCurrentUser, logout as authLogout } from './services/authService'; // Import authService functions
// import Courses from './components/Courses';

// function App() {
//   const [user, setUser] = useState(null);

//   // Check for user on initial load
//   useEffect(() => {
//     const checkCurrentUser = async () => {
//       try {
//         const userResponse = await getCurrentUser();
//         setUser(userResponse.data);
//       } catch (error) {
//         // User is not authenticated or token is invalid
//         setUser(null);
//         localStorage.removeItem('token'); // Clear invalid token
//       }
//     };
//     checkCurrentUser();
//   }, []); // Empty dependency array means this runs once on mount

//   const logout = () => {
//     authLogout(); // Call logout function from authService
//     setUser(null);
//     // Optional: Redirect to home or login after logout
//     // navigate('/');
//   };

//   return (
//     <Router>
//       <div className="App">
//         {/* Pass user state and logout handler to Navigation */}
//         <Navigation user={user} logout={logout} />
//         <main className="container mt-4">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             {/* Pass setUser to Login and Register */}
//             <Route path="/login" element={<Login setUser={setUser} />} />
//             <Route path="/register" element={<Register setUser={setUser} />} />

//             {/* Protected Dashboard route */}
//             <Route
//               path="/dashboard"
//               element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
//             />

//             {/* Add other routes here */}
//             <Route path="/courses" element={<>{console.log('Courses User Prop:', user)}<Courses user={user} /></>} />

//             {/* Fallback route for 404 */} 
//              <Route path="*" element={<div>404 Not Found</div>} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;

// 2nd App.jsx 

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { UserProvider, UserContext } from './context/UserContext';

// import Home from './components/Home';
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard';
// import Navigation from './components/Navigation';
// import Courses from './components/Courses';
// import { logout as authLogout } from './services/authService';

// function App() {
//   return (
//     <UserProvider>
//       <Router>
//         <UserContext.Consumer>
//           {({ user, setUser }) => {
//             const logout = () => {
//               authLogout();
//               setUser(null);
//             };

//             return (
//               <div className="App">
//                 <Navigation user={user} logout={logout} />
//                 <main className="container mt-4">
//                   <Routes>
//                     <Route path="/" element={<Home />} />
//                     <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
//                     <Route path="/register" element={<Register setUser={setUser} />} />
//                     <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
//                     <Route path="/courses" element={<Courses user={user} />} />
//                     <Route path="*" element={<div>404 Not Found</div>} />
//                   </Routes>
//                 </main>
//               </div>
//             );
//           }}
//         </UserContext.Consumer>
//       </Router>
//     </UserProvider>
//   );
// }

// export default App;

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import PublicLayout from './components/PublicLayout';
import PrivateLayout from './components/PrivateLayout';
import InstructorAssessments from './components/InstructorAssessments';
import CreateAssessment from './components/CreateAssessment';
import ManageAssessmentQuestions from './components/ManageAssessmentQuestions';
import EditAssessment from './components/EditAssessment';
import StudentAssessments from './components/StudentAssessments';
import StudentAttemptAssessment from './components/StudentAttemptAssessment';
import StudentAttemptedAssessments from './components/StudentAttemptedAssessment';
import StudentEnrolledCourses from './components/StudentEnrolledCourses';
import InstructorCourseStudents from './components/InstructorCourseStudents';

function AppRoutes() {
  const { user, setUser } = useUser();

  return (
    <Routes>
      {/* Public layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Private layout */}
      <Route element={<PrivateLayout />}>
      <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
      <Route path="/courses" element={user ? <Courses user={user} /> : <Navigate to="/login" replace />} />

      {user?.role?.toLowerCase() === 'instructor' && (
        <>
          <Route path="/instructor/assessments" element={<InstructorAssessments user={user} />} />
          <Route path="/assessments/create" element={<CreateAssessment user={user} />} />
          <Route path="/instructor/assessments/:assessmentId/manage" element={<ManageAssessmentQuestions />} />
          <Route path="/instructor/assessments/edit/:id" element={<EditAssessment />} />
          <Route path="/instructor/enrolled-students" element={<InstructorCourseStudents />} />

        </>
      )}

      {user?.role?.toLowerCase() === 'student' && (
        <>
        <Route path="/student/assessments" element={<StudentAssessments user={user} />} />
        <Route path="/student/assessments/:assessmentId/attempt" element={<StudentAttemptAssessment user={user} />}/>
        <Route path="/student/attempted" element={<StudentAttemptedAssessments user={user} />} />
        <Route path="/student/enrolled-courses" element={<StudentEnrolledCourses />} />



        </>
        
        
      )}
    </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
