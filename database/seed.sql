-- ============================================================================
-- PROJECTHUB AI - SEED DATA
-- Realistic Production Mock Data for Instant Demonstration & Evaluation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED SKILLS MASTER
-- ----------------------------------------------------------------------------
INSERT INTO skills (id, name, category) VALUES
('sk-01', 'React', 'Frontend'),
('sk-02', 'Next.js', 'Frontend'),
('sk-03', 'Tailwind CSS', 'Frontend'),
('sk-04', 'TypeScript', 'Frontend'),
('sk-05', 'Node.js', 'Backend'),
('sk-06', 'Express.js', 'Backend'),
('sk-07', 'Java', 'Backend'),
('sk-08', 'Spring Boot', 'Backend'),
('sk-09', 'Python', 'Backend'),
('sk-10', 'FastAPI', 'Backend'),
('sk-11', 'PostgreSQL', 'Database'),
('sk-12', 'MongoDB', 'Database'),
('sk-13', 'Redis', 'Database'),
('sk-14', 'PyTorch', 'AI_ML'),
('sk-15', 'TensorFlow', 'AI_ML'),
('sk-16', 'Scikit-learn', 'AI_ML'),
('sk-17', 'Docker', 'Cloud_DevOps'),
('sk-18', 'Kubernetes', 'Cloud_DevOps'),
('sk-19', 'AWS', 'Cloud_DevOps'),
('sk-20', 'Figma', 'Design'),
('sk-21', 'UI/UX Prototyping', 'Design'),
('sk-22', 'Solidity', 'Blockchain'),
('sk-23', 'Web3.js', 'Blockchain'),
('sk-24', 'Flutter', 'Mobile'),
('sk-25', 'React Native', 'Mobile');

-- ----------------------------------------------------------------------------
-- 2. SEED ADMINS
-- Password for all seed users: Password@123 (hashed with bcrypt)
-- ----------------------------------------------------------------------------
INSERT INTO admins (id, full_name, email, password_hash, department, role) VALUES
('adm-01', 'Dr. Ramesh Kumar', 'admin.cse@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 'HOD'),
('adm-02', 'Prof. Sarah Chen', 'sarah.chen@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 'FACULTY_ADMIN'),
('adm-03', 'Dr. Rajesh Nair', 'rajesh.nair@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'AIML', 'FACULTY_ADMIN');

-- ----------------------------------------------------------------------------
-- 3. SEED STUDENTS
-- ----------------------------------------------------------------------------
-- Default student demo user: Alex Morgan (USN: 1MS21CS001, Dept: CSE, Year: 3, Sec: A)
INSERT INTO students (id, usn, full_name, email, password_hash, department, year, section, experience_level, bio, avatar_url, availability_status) VALUES
('stu-01', '1MS21CS001', 'Alex Morgan', 'alex.morgan@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 3, 'A', 'Advanced', 'Full-stack developer passionate about distributed systems and cloud microservices.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'AVAILABLE'),
('stu-02', '1MS21CS042', 'Rohit Sharma', 'rohit.sharma@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 3, 'A', 'Intermediate', 'Frontend enthusiast specializing in React, Next.js, and interactive motion design.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'AVAILABLE'),
('stu-03', '1MS21CS089', 'Priya Sundaram', 'priya.s@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 3, 'A', 'Advanced', 'Machine Learning researcher working with LLMs, NLP tokenization and PyTorch pipelines.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'AVAILABLE'),
('stu-04', '1MS21CS115', 'Kavya Rao', 'kavya.rao@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 3, 'A', 'Intermediate', 'Product designer & UI/UX specialist who turns complex workflows into intuitive software.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'AVAILABLE'),
('stu-05', '1MS21CS028', 'David Miller', 'david.m@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 3, 'A', 'Beginner', 'Backend explorer passionate about Java Spring Boot and relational database design.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'AVAILABLE'),
('stu-06', '1MS21CS199', 'Ananya Gupta', 'ananya.g@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'CSE', 3, 'B', 'Advanced', 'Cloud architect exploring Kubernetes clustering and CI/CD automated deployments.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'AVAILABLE'),
('stu-07', '1MS21AI015', 'Vikram Varma', 'vikram.v@college.edu', '$2a$10$rZcM1sT8k7p6n3w4q5y7e8u9i0o1p2a3s4d5f6g7h8j9k0l1z2x3c', 'AIML', 3, 'A', 'Advanced', 'Computer Vision engineer specializing in OpenCV, YOLO object detection and edge inference.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'AVAILABLE');

-- ----------------------------------------------------------------------------
-- 4. SEED STUDENT SKILLS
-- ----------------------------------------------------------------------------
INSERT INTO student_skills (id, student_id, skill_id, proficiency_level) VALUES
('ssk-01', 'stu-01', 'sk-01', 'Expert'),       -- Alex: React
('ssk-02', 'stu-01', 'sk-05', 'Expert'),       -- Alex: Node.js
('ssk-03', 'stu-01', 'sk-11', 'Intermediate'), -- Alex: PostgreSQL
('ssk-04', 'stu-01', 'sk-17', 'Intermediate'), -- Alex: Docker
('ssk-05', 'stu-02', 'sk-01', 'Expert'),       -- Rohit: React
('ssk-06', 'stu-02', 'sk-03', 'Expert'),       -- Rohit: Tailwind CSS
('ssk-07', 'stu-02', 'sk-04', 'Intermediate'), -- Rohit: TypeScript
('ssk-08', 'stu-03', 'sk-09', 'Expert'),       -- Priya: Python
('ssk-09', 'stu-03', 'sk-14', 'Expert'),       -- Priya: PyTorch
('ssk-10', 'stu-03', 'sk-10', 'Intermediate'), -- Priya: FastAPI
('ssk-11', 'stu-04', 'sk-20', 'Expert'),       -- Kavya: Figma
('ssk-12', 'stu-04', 'sk-21', 'Expert'),       -- Kavya: UI/UX Prototyping
('ssk-13', 'stu-04', 'sk-03', 'Intermediate'), -- Kavya: Tailwind CSS
('ssk-14', 'stu-05', 'sk-07', 'Intermediate'), -- David: Java
('ssk-15', 'stu-05', 'sk-08', 'Beginner'),     -- David: Spring Boot
('ssk-16', 'stu-05', 'sk-11', 'Intermediate'); -- David: PostgreSQL

-- ----------------------------------------------------------------------------
-- 5. SEED PROJECTS
-- Projects explicitly target Department, Year, and Section for Cohort Visibility!
-- ----------------------------------------------------------------------------
INSERT INTO projects (id, title, description, department, year, section, deadline, team_size, priority, status, created_by_admin_id) VALUES
(
  'proj-01', 
  'AI Resume Analyzer & ATS Score Optimizer', 
  'An intelligent platform utilizing LLM embeddings and NLP parsers to analyze candidate resumes against job descriptions, highlighting keyword gaps and formatting bottlenecks.', 
  'CSE', 3, 'A', 
  '2026-12-15', 4, 'HIGH', 'PUBLISHED', 'adm-02'
),
(
  'proj-02', 
  'Distributed Event-Driven Microservices Hub', 
  'High-throughput asynchronous order processing engine built with Kafka event streams, Redis caching, Spring Boot microservices, and Docker Swarm orchestration.', 
  'CSE', 3, 'A', 
  '2026-12-20', 4, 'CRITICAL', 'PUBLISHED', 'adm-01'
),
(
  'proj-03', 
  'Decentralized Academic Credential Verification Vault', 
  'Tamper-proof blockchain smart contract protocol for university transcript issuance, instant third-party employer verification, and zero-knowledge privacy proof generation.', 
  'CSE', 3, 'A', 
  '2026-12-30', 3, 'MEDIUM', 'PUBLISHED', 'adm-02'
),
(
  'proj-04', 
  'Autonomous Campus Drone Navigation & Delivery', 
  'Edge-computed computer vision pipeline for collision-free autonomous indoor and outdoor drone quadcopter navigation across college campus zones.', 
  'AIML', 3, 'A', 
  '2026-12-28', 4, 'HIGH', 'PUBLISHED', 'adm-03'
),
(
  'proj-05', 
  'Cloud-Native Healthcare Telemetry System', 
  'HIPAA-compliant IoT wearable telemetry ingest system aggregating real-time patient heart rate, ECG, and oxygen levels with automated critical anomaly alerting.', 
  'CSE', 3, 'B', 
  '2027-01-10', 4, 'MEDIUM', 'PUBLISHED', 'adm-01'
);

-- ----------------------------------------------------------------------------
-- 6. SEED PROJECT REQUIRED SKILLS
-- ----------------------------------------------------------------------------
INSERT INTO project_skills (id, project_id, skill_id, is_required) VALUES
('psk-01', 'proj-01', 'sk-09', TRUE),  -- AI Resume: Python
('psk-02', 'proj-01', 'sk-14', TRUE),  -- AI Resume: PyTorch
('psk-03', 'proj-01', 'sk-01', TRUE),  -- AI Resume: React
('psk-04', 'proj-01', 'sk-10', FALSE), -- AI Resume: FastAPI
('psk-05', 'proj-02', 'sk-07', TRUE),  -- Microservices: Java
('psk-06', 'proj-02', 'sk-08', TRUE),  -- Microservices: Spring Boot
('psk-07', 'proj-02', 'sk-17', TRUE),  -- Microservices: Docker
('psk-08', 'proj-02', 'sk-11', TRUE),  -- Microservices: PostgreSQL
('psk-09', 'proj-03', 'sk-22', TRUE),  -- Blockchain: Solidity
('psk-10', 'proj-03', 'sk-01', TRUE),  -- Blockchain: React
('psk-11', 'proj-03', 'sk-05', TRUE);  -- Blockchain: Node.js

-- ----------------------------------------------------------------------------
-- 7. SEED TEAMS & MEMBERS
-- ----------------------------------------------------------------------------
INSERT INTO teams (id, project_id, team_name, leader_id, status) VALUES
('team-01', 'proj-01', 'NeuralMatrix', 'stu-03', 'FORMING'),
('team-02', 'proj-02', 'CloudPioneers', 'stu-01', 'FORMING');

INSERT INTO team_members (id, team_id, student_id, role) VALUES
('tm-01', 'team-01', 'stu-03', 'Leader & ML Lead'),
('tm-02', 'team-01', 'stu-02', 'Frontend Engineer'),
('tm-03', 'team-02', 'stu-01', 'Leader & Full-Stack Architect');

-- ----------------------------------------------------------------------------
-- 8. SEED TEAM REQUESTS
-- ----------------------------------------------------------------------------
INSERT INTO requests (id, sender_id, receiver_id, team_id, project_id, type, status, message) VALUES
(
  'req-01', 
  'stu-01', 'stu-03', 'team-01', 'proj-01', 
  'JOIN_TEAM', 'PENDING', 
  'Hi Priya! I have extensive React and Node.js production experience. I would love to build the frontend and API gateway for your AI Resume Analyzer.'
),
(
  'req-02', 
  'stu-01', 'stu-04', 'team-02', 'proj-02', 
  'INVITE_STUDENT', 'PENDING', 
  'Hey Kavya, we are building the CloudPioneers microservices dashboard and need your UI/UX prototyping skills!'
),
(
  'req-03', 
  'stu-05', 'stu-01', 'team-02', 'proj-02', 
  'JOIN_TEAM', 'ACCEPTED', 
  'Hello Alex, I can assist with Java Spring Boot backend services and database schema setup.'
);

-- ----------------------------------------------------------------------------
-- 9. SEED PROJECT PROGRESS & MILESTONES
-- ----------------------------------------------------------------------------
INSERT INTO project_progress (id, project_id, team_id, status, completion_percentage, current_milestone, milestone_deadline, notes) VALUES
(
  'prog-01', 'proj-01', 'team-01', 'DEVELOPMENT', 55, 
  'Transformer Pipeline & Embeddings Integration', '2026-11-30', 
  'Resume parser completed. Vector search indexing via Pinecone currently being integrated.'
),
(
  'prog-02', 'proj-02', 'team-02', 'PLANNING', 25, 
  'Architecture Diagram & Service Contracts Approval', '2026-12-05', 
  'Swagger OpenAPI schemas agreed upon. Spring Boot scaffold setup.'
);

-- ----------------------------------------------------------------------------
-- 10. SEED QUERIES & FACULTY RESOLUTION
-- ----------------------------------------------------------------------------
INSERT INTO queries (id, student_id, project_id, subject, query_text, category, admin_reply, status, replied_by_admin_id) VALUES
(
  'q-01', 'stu-01', 'proj-01', 
  'Dataset licensing for ATS models', 
  'Are we allowed to use the Kaggle Resume Corpus v3 for pre-training our ATS scoring model?', 
  'TECHNICAL', 
  'Yes Alex, open-access academic datasets on Kaggle are pre-approved for capstone evaluation.', 
  'RESOLVED', 'adm-02'
),
(
  'q-02', 'stu-03', 'proj-01', 
  'GPU cluster allocation request', 
  'We need access to the college NVIDIA A100 GPU cluster for token embedding fine-tuning.', 
  'TECHNICAL', 
  NULL, 
  'OPEN', NULL
);

-- ----------------------------------------------------------------------------
-- 11. SEED NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, user_type, title, message, link, is_read) VALUES
('notif-01', 'stu-01', 'STUDENT', 'New Team Request Received', 'David Miller requested to join CloudPioneers.', '/requests', FALSE),
('notif-02', 'stu-01', 'STUDENT', 'Query Resolved', 'Prof. Sarah Chen replied to your dataset query.', '/queries', TRUE),
('notif-03', 'adm-02', 'ADMIN', 'New Milestone Submitted', 'NeuralMatrix submitted Development Milestone progress.', '/admin/projects', FALSE);
