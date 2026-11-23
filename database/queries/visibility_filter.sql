-- ============================================================================
-- COHORT VISIBILITY FILTER QUERY
-- Strictly ensures only students matching (Department, Year, Section) can view projects!
-- Example: CSE, Year 3, Section A students can ONLY see projects for CSE-3-A.
-- Admins can query with optional filters to inspect all cohorts.
-- ============================================================================

-- Query 1: Get Projects Visible to a Specific Student
-- Parameters: :student_id
SELECT 
    p.id AS project_id,
    p.title,
    p.description,
    p.department,
    p.year,
    p.section,
    p.deadline,
    p.team_size,
    p.priority,
    p.status,
    p.created_at,
    a.full_name AS faculty_creator,
    COUNT(DISTINCT t.id) AS total_teams_registered,
    COUNT(DISTINCT tm.student_id) AS total_enrolled_members,
    (p.team_size - COALESCE(COUNT(DISTINCT tm.student_id), 0)) AS remaining_slots
FROM projects p
JOIN students s ON s.id = :student_id
JOIN admins a ON p.created_by_admin_id = a.id
LEFT JOIN teams t ON t.project_id = p.id
LEFT JOIN team_members tm ON tm.team_id = t.id
WHERE 
    p.status = 'PUBLISHED'
    AND p.department = s.department
    AND p.year = s.year
    AND p.section = s.section
GROUP BY p.id, a.full_name
ORDER BY p.deadline ASC;

-- Query 2: Direct Parameterized Cohort Filter
-- Parameters: :dept, :year, :section
SELECT 
    p.*,
    a.full_name AS faculty_creator
FROM projects p
JOIN admins a ON p.created_by_admin_id = a.id
WHERE 
    p.status = 'PUBLISHED'
    AND p.department = :dept
    AND p.year = :year
    AND p.section = :section
ORDER BY p.created_at DESC;
