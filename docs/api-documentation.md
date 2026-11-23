# ProjectHub AI — RESTful API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a new student account.
- **Request Body**:
  ```json
  {
    "fullName": "Alex Morgan",
    "usn": "1MS21CS001",
    "email": "alex.morgan@college.edu",
    "department": "CSE",
    "year": 3,
    "section": "A",
    "experienceLevel": "Advanced",
    "skills": ["React", "Node.js", "PostgreSQL"],
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Student account successfully created!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
  ```

### `POST /auth/login/student`
Authenticate student via USN or Email.
- **Request Body**:
  ```json
  {
    "identifier": "1MS21CS001",
    "password": "Password@123"
  }
  ```

### `POST /auth/login/admin`
Authenticate faculty administrator.
- **Request Body**:
  ```json
  {
    "email": "sarah.chen@college.edu",
    "password": "Password@123"
  }
  ```

---

## 2. Project Endpoints

### `GET /projects/visible`
Returns projects authorized for the authenticated student's Department, Year, and Section.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 3,
    "cohort": "CSE - Year 3 - Sec A",
    "projects": [
      {
        "id": "proj-01",
        "title": "AI Resume Analyzer & ATS Score Optimizer",
        "department": "CSE",
        "year": 3,
        "section": "A",
        "teamSize": 4,
        "remainingSlots": 2,
        "requiredSkills": ["Python", "PyTorch", "React", "FastAPI"],
        "matchScore": 92
      }
    ]
  }
  ```

### `GET /projects/recommended`
Returns visible projects ranked in descending order of the student's skill match index.

---

## 3. Team & Request Endpoints

### `POST /teams`
Create a new project squad.
- **Request Body**:
  ```json
  {
    "projectId": "proj-02",
    "teamName": "CloudPioneers"
  }
  ```

### `POST /requests`
Send a team join request or member invitation.
- **Request Body**:
  ```json
  {
    "projectId": "proj-01",
    "teamId": "team-01",
    "type": "JOIN_TEAM",
    "message": "I would like to lead the React frontend implementation."
  }
  ```

### `PUT /requests/:requestId/accept`
Accept a pending team request and auto-enroll the candidate.

---

## 4. Admin Endpoints

### `GET /admin/analytics`
Fetch platform operational KPIs and progress distributions.

### `POST /admin/projects`
Publish a new capstone project with cohort rules.
