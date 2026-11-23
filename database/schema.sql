-- ============================================================================
-- PROJECTHUB AI - DATABASE SCHEMA
-- Student Project Collaboration & Team Formation Platform
-- Compatible with PostgreSQL / MySQL / SQLite
-- ============================================================================

-- Drop existing tables in reverse dependency order if resetting
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS queries CASCADE;
DROP TABLE IF EXISTS project_progress CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS project_skills CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- ----------------------------------------------------------------------------
-- 1. STUDENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    usn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL,    -- e.g. 'CSE', 'ISE', 'AIML', 'ECE'
    year INT NOT NULL,                  -- e.g. 1, 2, 3, 4
    section VARCHAR(5) NOT NULL,        -- e.g. 'A', 'B', 'C'
    experience_level VARCHAR(20) NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
    bio TEXT,
    avatar_url VARCHAR(255),
    availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'IN_TEAM', 'BUSY'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for instant student lookups and cohort visibility checks
CREATE INDEX idx_students_cohort ON students (department, year, section);
CREATE INDEX idx_students_usn ON students (usn);
CREATE INDEX idx_students_email ON students (email);

-- ----------------------------------------------------------------------------
-- 2. ADMINS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'FACULTY_ADMIN', -- 'SUPER_ADMIN', 'FACULTY_ADMIN', 'HOD'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_email ON admins (email);

-- ----------------------------------------------------------------------------
-- 3. SKILLS MASTER TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL -- 'Frontend', 'Backend', 'AI_ML', 'Cloud_DevOps', 'Mobile', 'Design', 'Core'
);

CREATE INDEX idx_skills_name ON skills (name);

-- ----------------------------------------------------------------------------
-- 4. STUDENT SKILLS MAPPING
-- ----------------------------------------------------------------------------
CREATE TABLE student_skills (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id VARCHAR(36) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Expert'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

CREATE INDEX idx_student_skills_student ON student_skills (student_id);
CREATE INDEX idx_student_skills_skill ON student_skills (skill_id);

-- ----------------------------------------------------------------------------
-- 5. PROJECTS TABLE (With Strict Cohort Isolation)
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(50) NOT NULL,    -- Required for cohort visibility
    year INT NOT NULL,                  -- Required for cohort visibility
    section VARCHAR(5) NOT NULL,        -- Required for cohort visibility
    deadline DATE NOT NULL,
    team_size INT NOT NULL DEFAULT 4,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED', -- 'DRAFT', 'PUBLISHED', 'ARCHIVED', 'COMPLETED'
    created_by_admin_id VARCHAR(36) NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compound index for optimal cohort isolation queries
CREATE INDEX idx_projects_cohort_visibility ON projects (department, year, section, status);

-- ----------------------------------------------------------------------------
-- 6. PROJECT SKILLS MAPPING (Required Skills for Matchmaking)
-- ----------------------------------------------------------------------------
CREATE TABLE project_skills (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id VARCHAR(36) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_project_skill UNIQUE (project_id, skill_id)
);

CREATE INDEX idx_project_skills_project ON project_skills (project_id);

-- ----------------------------------------------------------------------------
-- 7. TEAMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    leader_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'FORMING', -- 'FORMING', 'FULL', 'LOCKED', 'DISBANDED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_project ON teams (project_id);
CREATE INDEX idx_teams_leader ON teams (leader_id);

-- ----------------------------------------------------------------------------
-- 8. TEAM MEMBERS MAPPING
-- ----------------------------------------------------------------------------
CREATE TABLE team_members (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'Developer', -- 'Leader', 'Frontend Specialist', 'Backend Architect', etc.
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_student UNIQUE (team_id, student_id)
);

CREATE INDEX idx_team_members_team ON team_members (team_id);
CREATE INDEX idx_team_members_student ON team_members (student_id);

-- ----------------------------------------------------------------------------
-- 9. TEAM REQUESTS & INVITATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE requests (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    receiver_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- 'JOIN_TEAM' (Student -> Leader), 'INVITE_STUDENT' (Leader -> Student)
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_requests_receiver ON requests (receiver_id, status);
CREATE INDEX idx_requests_sender ON requests (sender_id, status);
CREATE INDEX idx_requests_team ON requests (team_id);

-- ----------------------------------------------------------------------------
-- 10. PROJECT PROGRESS TRACKING
-- ----------------------------------------------------------------------------
CREATE TABLE project_progress (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    team_id VARCHAR(36) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED', 
    -- 'NOT_STARTED', 'PLANNING', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'COMPLETED'
    completion_percentage INT NOT NULL DEFAULT 0,
    current_milestone VARCHAR(150),
    milestone_deadline DATE,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_progress_team ON project_progress (team_id);

-- ----------------------------------------------------------------------------
-- 11. STUDENT QUERIES & FACULTY RESOLUTION
-- ----------------------------------------------------------------------------
CREATE TABLE queries (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
    subject VARCHAR(150) NOT NULL,
    query_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'TECHNICAL', -- 'TECHNICAL', 'TEAM_DISPUTE', 'ADMINISTRATIVE', 'DEADLINE'
    admin_reply TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'IN_REVIEW', 'RESOLVED'
    replied_by_admin_id VARCHAR(36) REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_queries_student ON queries (student_id);
CREATE INDEX idx_queries_status ON queries (status);

-- ----------------------------------------------------------------------------
-- 12. SYSTEM NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_type VARCHAR(10) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT', 'ADMIN'
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);
