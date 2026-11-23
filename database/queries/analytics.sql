-- ============================================================================
-- ADMIN ANALYTICS & MONITORING QUERIES
-- High-level operational intelligence for faculty and platform administrators.
-- ============================================================================

-- Query 1: Executive KPI Metrics
SELECT
    (SELECT COUNT(*) FROM projects) AS total_projects,
    (SELECT COUNT(*) FROM projects WHERE status = 'PUBLISHED') AS active_projects,
    (SELECT COUNT(*) FROM students WHERE is_active = TRUE) AS registered_students,
    (SELECT COUNT(*) FROM teams) AS teams_formed,
    (SELECT COUNT(*) FROM students WHERE availability_status = 'AVAILABLE') AS pending_students,
    (SELECT COUNT(*) FROM project_progress WHERE status = 'COMPLETED') AS completed_projects,
    (SELECT COUNT(*) FROM queries WHERE status = 'OPEN') AS open_queries;

-- Query 2: Cohort Team Formation Progress Breakdown
SELECT 
    p.department,
    p.year,
    p.section,
    COUNT(DISTINCT p.id) AS total_projects_posted,
    COUNT(DISTINCT t.id) AS total_teams_active,
    COUNT(DISTINCT tm.student_id) AS total_students_placed,
    ROUND(
        AVG(COALESCE(prog.completion_percentage, 0)), 1
    ) AS avg_milestone_progress
FROM projects p
LEFT JOIN teams t ON t.project_id = p.id
LEFT JOIN team_members tm ON tm.team_id = t.id
LEFT JOIN project_progress prog ON prog.team_id = t.id
GROUP BY p.department, p.year, p.section
ORDER BY p.department, p.year, p.section;

-- Query 3: Skill Demand vs Supply Analysis
WITH Demand AS (
    SELECT 
        sk.name AS skill_name, 
        COUNT(ps.id) AS demand_count
    FROM skills sk
    JOIN project_skills ps ON sk.id = ps.skill_id
    GROUP BY sk.name
),
Supply AS (
    SELECT 
        sk.name AS skill_name, 
        COUNT(ssk.id) AS supply_count
    FROM skills sk
    JOIN student_skills ssk ON sk.id = ssk.skill_id
    GROUP BY sk.name
)
SELECT 
    d.skill_name,
    d.demand_count AS projects_requiring_skill,
    COALESCE(s.supply_count, 0) AS students_with_skill,
    (COALESCE(s.supply_count, 0) - d.demand_count) AS surplus_or_deficit
FROM Demand d
LEFT JOIN Supply s ON d.skill_name = s.skill_name
ORDER BY d.demand_count DESC;
