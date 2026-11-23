# ProjectHub AI — Product Requirements Document (PRD)

## 1. Executive Summary
**ProjectHub AI** is an enterprise-grade academic collaboration and intelligent team formation SaaS platform designed for universities and engineering institutions. It solves the perennial chaos of manual, imbalanced, and biased capstone team formation through mathematical skill telemetry, constraint-based cohort isolation, automated request workflows, and live milestone velocity tracking.

---

## 2. User Roles & Personas

### 2.1 Student Persona
- **Goal**: Discover authorized capstone projects, identify complementary technical peers (e.g., matching a Frontend engineer with a Backend architect and ML specialist), form teams, submit progress milestones, and receive faculty guidance.
- **Key Pain Point**: Forming groups with friends without balanced technical skills, leading to project failure or unequal workload.

### 2.2 Faculty / Admin Persona
- **Goal**: Oversee hundreds of capstone candidates, publish department-specific projects with strict section rules, monitor team formation progress, evaluate milestones, and resolve student roadblocks.
- **Key Pain Point**: Inability to track unassigned students, lack of skill distribution visibility, and endless email threads for administrative questions.

---

## 3. Functional Specifications

### 3.1 Authentication & Profile Module
- **Student Registration**: Validates Full Name, USN / Roll Number, Institutional Email, Department, Academic Year (1–4), Section (A, B, C), Technical Skills, Experience Level (Beginner, Intermediate, Advanced), and Password with confirmation.
- **Student Login**: Identifier-flexible login (USN or Email) with JWT session issuance.
- **Admin Login**: Dedicated faculty portal login.

### 3.2 Strict Project Cohort Visibility System
- **Constraint Rule**: A project assigned to `(Department: CSE, Year: 3, Section: A)` must be strictly invisible to students from other sections or departments.
- **Security**: Cohort isolation is verified at the database query layer (`database/queries/visibility_filter.sql`) and backend middleware layer (`backend/services/visibilityService.js`).

### 3.3 AI-Powered Skill Matchmaking Engine
- Computes compatibility score between a student's active skills and the project's technical requirements.
- Recommends project candidates and surfaces missing complementary skills.

### 3.4 Team Formation & Request Lifecycle
- **Squad Limits**: Enforces hard caps on team sizes (e.g., maximum 4 students).
- **Request States**: `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`.
- **Workflow**: Student applies to join $\rightarrow$ Leader receives inbound notification $\rightarrow$ Leader accepts $\rightarrow$ System verifies capacity and enrolls student $\rightarrow$ Auto-locks team when capacity is reached.

### 3.5 Milestone Velocity & Progress Tracking
- Tracks phases: `NOT_STARTED` $\rightarrow$ `PLANNING` $\rightarrow$ `DEVELOPMENT` $\rightarrow$ `TESTING` $\rightarrow$ `DEPLOYMENT` $\rightarrow$ `COMPLETED`.
- Real-time percentage completion and milestone deadline monitoring.

### 3.6 Faculty Queries & Support Stream
- Direct inquiry channel allowing students to raise technical, dataset, or team dispute queries.
- Admins can review, reply, and mark queries as resolved.

---

## 4. Non-Functional Specifications
- **Design Standard**: World-class SaaS appearance inspired by Linear, Stripe, Vercel, and Framer.
- **Performance**: $< 150\text{ms}$ query response time.
- **Responsiveness**: Fluid layout across Desktop ($1440\text{px}$), Laptop ($1024\text{px}$), Tablet ($768\text{px}$), and Mobile ($375\text{px}$).
- **Accessibility**: High-contrast WCAG 2.1 AA compliant color tokens, semantic HTML5, and full keyboard navigation.
