// // src/context/UserContext.js
// import React, { createContext, useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // Rehydrate user from JWT on load
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         setUser({
//           userId: decoded.nameid || decoded.sub,
//           email: decoded.email,
//           role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
//         });
//       } catch (err) {
//         console.error('❌ Failed to decode token', err);
//         localStorage.removeItem('token');
//         setUser(null);
//       }
//     }
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// src/context/UserContext.js

// import React, { createContext, useState, useEffect, useContext } from 'react';
// import { getCurrentUser } from '../services/authService';

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // On initial load, try to fetch current user if token exists
//   useEffect(() => {
//     const initializeUser = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       try {
//         const response = await getCurrentUser(); // GET /users/me
//         setUser(response.data); // This assumes response.data = { name, role, userId, ... }
//       } catch (error) {
//         console.error('Failed to rehydrate user from token:', error);
//         localStorage.removeItem('token');
//         setUser(null);
//       }
//     };

//     initializeUser();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
