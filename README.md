# ProjectHub AI — Student Project Collaboration & Team Formation Platform

A startup-grade academic platform built to solve the capstone team formation challenge through **algorithmic skill matchmaking, multi-tenant cohort visibility isolation, and automated team collaboration workflows**.

Designed with modern SaaS aesthetics inspired by **Linear, Stripe Dashboard, Vercel, Framer, and Notion**.

---

## 🚀 Key Highlights & Architectural Strengths

1. **Role-Based Portals**:
   - **Student Portal**: Discover cohort projects, AI-recommended projects based on skills, search peer teammates with filters, manage team requests, track milestone velocity, and submit queries.
   - **Faculty Admin Portal**: Executive KPI analytics dashboard, section-based project creator with strict cohort rules, and student inquiry resolution center.
2. **Strict Cohort Visibility Isolation**:
   - Only students matching the project's exact `(Department, Year, Section)` can view and apply for that project (e.g., CSE 3rd Year Section A).
3. **AI Skill Matchmaking**:
   - Calculates mathematical compatibility percentage between student competencies and project specifications.
4. **Dual-Mode Execution**:
   - Works seamlessly with the live **Node.js Express REST API**.
   - Also features a built-in **Browser Mock Engine** so evaluators can test every feature instantly by simply double-clicking `frontend/index.html`!

---

## 📁 Repository Structure

```
javaminiproject/
│
├── frontend/
│   ├── index.html                    # Single Page Application master runtime
│   ├── pages/                        # Modular reference page templates
│   │   ├── student-dashboard.html
│   │   ├── admin-dashboard.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── project-details.html
│   │   └── create-project.html
│   ├── components/                   # Modular UI components
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   ├── project-card.html
│   │   ├── student-card.html
│   │   ├── team-modal.html
│   │   └── toast.html
│   ├── assets/                       # Vector iconography
│   │   └── icons.svg
│   ├── styles/                       # Design system stylesheets
│   │   ├── main.css                  # Design tokens, reset, mesh background
│   │   ├── components.css            # Buttons, inputs, badges, cards, modals
│   │   ├── dashboard.css             # Navbar, sidebar, grids, timelines
│   │   └── animations.css            # Framer Motion style keyframes & shimmers
│   └── scripts/                      # Client-side JavaScript
│       ├── app.js                    # SPA router & notification dispatcher
│       ├── auth.js                   # Client authentication logic
│       ├── api.js                    # Dual-mode API service layer
│       ├── student-dashboard.js      # 6 student modules controller
│       ├── admin-dashboard.js        # Admin analytics & project publisher
│       └── mockData.js               # Standalone evaluation data engine
│
├── backend/
│   ├── server.js                     # Express REST API server entrypoint
│   ├── package.json                  # Dependencies (Express, JWT, CORS, UUID)
│   ├── config/
│   │   ├── config.js                 # Environment configuration
│   │   └── db.js                     # Dual-mode database adapter
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification & role authorization
│   │   └── errorHandler.js           # Centralized exception handler
│   ├── models/                       # Entity models
│   ├── controllers/                  # 7 REST controllers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── projectController.js
│   │   ├── teamController.js
│   │   ├── requestController.js
│   │   ├── queryController.js
│   │   └── adminController.js
│   ├── services/                     # Business logic services
│   │   ├── matchingService.js        # Skill compatibility algorithm
│   │   ├── visibilityService.js      # Cohort isolation filter
│   │   └── analyticsService.js       # KPI metrics aggregator
│   └── routes/                       # Express route definitions
│       ├── authRoutes.js
│       ├── studentRoutes.js
│       ├── projectRoutes.js
│       ├── teamRoutes.js
│       ├── requestRoutes.js
│       ├── queryRoutes.js
│       └── adminRoutes.js
│
├── database/
│   ├── schema.sql                    # 12 relational tables with foreign keys & indexes
│   ├── seed.sql                      # Realistic test data for all cohorts & entities
│   └── queries/                      # Specialized operational SQL scripts
│       ├── visibility_filter.sql     # Cohort isolation SQL queries
│       ├── skill_matching.sql        # Jaccard skill match queries
│       ├── team_formation.sql        # Roster & vacancy queries
│       └── analytics.sql             # Executive analytics queries
│
├── docs/
│   ├── requirements.md               # Product Requirements Document (PRD)
│   ├── architecture.md               # Mermaid system architecture & ER diagram
│   └── api-documentation.md          # REST API endpoint specifications
│
└── README.md                         # Master documentation & guide
```

---

## ⚡ Quick Start & Demonstration

### Option 1: Direct Instant Evaluation (Zero Setup)
Simply open the master frontend file in any web browser:
```text
file:///c:/Users/Mokshith%20Reddy/javamproject/javaminiproject/frontend/index.html
```
- **Student Demo Account**: Pre-filled (`1MS21CS001` / `Password@123`)
- **Faculty Admin Demo**: Pre-filled (`sarah.chen@college.edu` / `Password@123`)

### Option 2: Run Full Node.js REST API
1. Navigate to the backend directory:
   ```powershell
   cd backend
   npm install
   npm start
   ```
2. The server runs at `http://localhost:5000` with live API endpoints.

---

## 👨‍🏫 Evaluator Walkthrough Guide

1. **Test Cohort Isolation**:
   - Log in as student **Alex Morgan** (CSE, Year 3, Section A).
   - Notice that projects for other cohorts (e.g. `AIML-3-A` or `CSE-3-B`) are filtered out automatically.
2. **Test AI Skill Matchmaking**:
   - Switch to the **Recommended** tab to view projects ordered by skill match percentage with visual tags.
3. **Test Teammate Discovery**:
   - Open **Find Teammates** and click "Send Team Request" to invite candidates with complementary skillsets.
4. **Test Faculty Admin & Section Publisher**:
   - Log out and switch to **Faculty Admin** (`sarah.chen@college.edu`).
   - Inspect the real-time KPI metrics.
   - Publish a new project specifying target Department, Year, and Section.
   - Check the **Student Inquiries** panel to reply and resolve open issues.
