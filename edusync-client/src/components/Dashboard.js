// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = ({ user }) => {
//   const navigate = useNavigate();
//   if (!user) return null;

//   const isInstructor = user.role.toLowerCase() === 'instructor';

//   return (
//     <div>
//       <h2 className="mb-4">Dashboard</h2>
//       <div className="row">
//         <div className="col-md-8">
//           <div className="card mb-4">
//             <div className="card-body">
//               <h3 className="card-title">Welcome, {user.name}</h3>
//               <p className="card-text">Role: <strong>{user.role}</strong></p>
//               <p className="card-text">Email: {user.email}</p>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <h4 className="card-title mb-3">Quick Actions</h4>
//               <div className="row">
//                 <div className="col-md-6 mb-3">
//                   <div className="card h-100">
//                     <div className="card-body">
//                       <h5 className="card-title">Courses</h5>
//                       <p className="card-text">View available courses and manage your enrollments.</p>
//                       <button
//                         className="btn btn-success mt-3"
//                         onClick={() => navigate('/courses')}
//                       >
//                         Access Courses
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="col-md-6 mb-3">
//                   <div className="card h-100">
//                     <div className="card-body">
//                       <h5 className="card-title">Assessments</h5>
//                       <p className="card-text">Check your assessments and view your performance.</p>
//                       <button
//                         className="btn btn-primary mt-3"
//                         onClick={() =>
//                           navigate(isInstructor ? '/instructor/assessments' : '/student/assessments')
//                         }
//                       >
//                         View Assessments
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="card mb-4">
//             <div className="card-body">
//               <h4 className="card-title mb-3">Recent Activity</h4>
//               <ul className="list-group list-group-flush">
//                 <li className="list-group-item">No recent activity</li>
//               </ul>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <h4 className="card-title mb-3">Notifications</h4>
//               <ul className="list-group list-group-flush">
//                 <li className="list-group-item">No new notifications</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  if (!user) return null;

  const isInstructor = user.role.toLowerCase() === 'instructor';

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-bold text-dark">Dashboard</h2>
      <div className="row">
        {/* Profile & Quick Actions */}
        <div className="col-md-8">
          <div className="card mb-4 shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h3 className="card-title text-primary">👋 Welcome, {user.name}</h3>
              <p className="card-text mb-1">Role: <strong>{user.role}</strong></p>
              <p className="card-text">Email: {user.email}</p>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body">
              <h4 className="card-title mb-3 text-secondary">⚡ Quick Actions</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="card h-100 shadow-sm border-0 rounded-3">
                    <div className="card-body">
                      <h5 className="card-title text-success">📚 Courses</h5>
                      <p className="card-text">View available courses and manage your enrollments.</p>
                      <button
                        className="btn btn-outline-success mt-3"
                        onClick={() => navigate('/courses')}
                      >
                        Access Courses
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="card h-100 shadow-sm border-0 rounded-3">
                    <div className="card-body">
                      <h5 className="card-title text-info">📝 Assessments</h5>
                      <p className="card-text">Check your assessments and view your performance.</p>
                      <button
                        className="btn btn-outline-primary mt-3"
                        onClick={() =>
                          navigate(isInstructor ? '/instructor/assessments' : '/student/assessments')
                        }
                      >
                        View Assessments
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      
    {/* Sidebar Section */}
      <div className="col-md-4">
        {/* Attempted Assessments – For Students */}
              {user.role.toLowerCase() === 'student' && (
              <>
                <div className="card shadow-sm border-0 rounded-4 mb-3">
                  <div className="card-body">
                    <h4 className="card-title mb-3 text-success">🎯 Enrolled Courses</h4>
                    <p className="card-text">See the courses you’ve joined.</p>
                    <button
                      className="btn btn-outline-success w-100"
                      onClick={() => navigate('/student/enrolled-courses')}
                    >
                      View Enrolled
                    </button>
                  </div>
                </div>

                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body">
                    <h4 className="card-title mb-3 text-success">📊 Attempted Assessments</h4>
                    <p className="card-text">Review your previous attempts and track performance.</p>
                    <button
                      className="btn btn-outline-success w-100"
                      onClick={() => navigate('/student/attempted')}
                    >
                      View Attempts
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Enrolled Students – For Instructors */}
            {isInstructor && (
              <div className="card shadow-sm border-0 rounded-4 mb-3">
              <div className="card-body">
                <h4 className="card-title mb-3 text-primary">👥 Enrolled Students</h4>
                <p className="card-text">Track enrollments and view student performance.</p>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => navigate('/instructor/enrolled-students')}
                >
                  View Students
                </button>
              </div>
            </div>
            
            )}


        </div>

      </div>
    </div>
  );
};

export default Dashboard;
