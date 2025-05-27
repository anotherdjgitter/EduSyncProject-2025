# EduSync - Learning Management System

EduSync is a full-stack Learning Management System (LMS) that enables educational institutions to manage courses, assessments, and student progress effectively.

## Project Structure

```
EduSync/
├── edusync-client/         # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/      # API services
│   │   └── App.js        # Main application component
│   └── package.json       # Frontend dependencies
│
└── EduSync.API/           # ASP.NET Core Backend
    ├── Controllers/       # API controllers
    ├── Models/           # Data models
    ├── Data/            # Database context
    └── appsettings.json # Configuration
```

## Prerequisites

- Node.js (v14 or later)
- .NET 6.0 SDK
- MySQL Server
- Visual Studio Code or Visual Studio 2022

## Database Setup

1. Install MySQL Server if not already installed
2. Create a new database:
```sql
CREATE DATABASE EduSyncDB;
```

## Backend Setup

1. Navigate to the API directory:
```bash
cd EduSync.API
```

2. Install dependencies:
```bash
dotnet restore
```

3. Update the database:
```bash
dotnet ef database update
```

4. Run the API:
```bash
dotnet run
```

The API will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the client directory:
```bash
cd edusync-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Features

- User authentication and role-based access control
- Course management (create, read, update, delete)
- Assessment creation and grading
- Real-time quiz monitoring
- File upload for course materials
- Progress tracking and analytics
- Responsive design for all devices

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register

### Courses
- GET /api/courses
- GET /api/courses/{id}
- POST /api/courses
- PUT /api/courses/{id}
- DELETE /api/courses/{id}

### Assessments
- GET /api/assessments
- POST /api/assessments
- GET /api/assessments/{id}
- PUT /api/assessments/{id}
- DELETE /api/assessments/{id}

### Results
- GET /api/results
- POST /api/results
- GET /api/results/{id}

## Technologies Used

- Frontend:
  - React.js with javascript
  - Bootstrap for styling
  - Axios for API calls
  - React Router for navigation

- Backend:
  - ASP.NET Core 6.0
  - Entity Framework Core
  - MySQL Database
  - JWT Authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 