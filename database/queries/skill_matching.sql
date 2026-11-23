-- ============================================================================
-- SKILL MATCHING ALGORITHM QUERIES
-- Calculates the compatibility percentage between a Student's Skillset
-- and a Project's required skills.
-- ============================================================================

-- Query 1: Calculate Skill Match Percentage for a Student Across All Visible Projects
-- Parameters: :student_id
WITH StudentSkillSet AS (
    SELECT skill_id 
    FROM student_skills 
    WHERE student_id = :student_id
),
ProjectRequirementSet AS (
    SELECT 
        ps.project_id,
        COUNT(ps.skill_id) AS total_required_skills,
        COUNT(ss.skill_id) AS matched_skills_count
    FROM project_skills ps
    LEFT JOIN StudentSkillSet ss ON ps.skill_id = ss.skill_id
    GROUP BY ps.project_id
)
SELECT 
    p.id AS project_id,
    p.title,
    prs.total_required_skills,
    COALESCE(prs.matched_skills_count, 0) AS matched_skills_count,
    ROUND(
        (COALESCE(prs.matched_skills_count, 0)::NUMERIC / NULLIF(prs.total_required_skills, 0)::NUMERIC) * 100, 
        1
    ) AS skill_match_percentage,
    STRING_AGG(DISTINCT sk.name, ', ') AS matched_skill_names
FROM projects p
JOIN ProjectRequirementSet prs ON p.id = prs.project_id
JOIN students s ON s.id = :student_id
LEFT JOIN project_skills ps ON ps.project_id = p.id
LEFT JOIN skills sk ON sk.id = ps.skill_id AND sk.id IN (SELECT skill_id FROM StudentSkillSet)
WHERE 
    p.status = 'PUBLISHED'
    AND p.department = s.department
    AND p.year = s.year
    AND p.section = s.section
GROUP BY p.id, prs.total_required_skills, prs.matched_skills_count
ORDER BY skill_match_percentage DESC;

-- Query 2: Find Ideal Teammate Candidates for a Specific Missing Project Skill
-- Parameters: :project_id, :target_skill_name, :cohort_dept, :cohort_year, :cohort_sec
SELECT 
    s.id AS student_id,
    s.full_name,
    s.department,
    s.experience_level,
    s.availability_status,
    sk.name AS skill_name,
    ssk.proficiency_level
FROM students s
JOIN student_skills ssk ON s.id = ssk.student_id
JOIN skills sk ON ssk.skill_id = sk.id
WHERE 
    sk.name = :target_skill_name
    AND s.department = :cohort_dept
    AND s.year = :cohort_year
    AND s.section = :cohort_sec
    AND s.availability_status = 'AVAILABLE'
ORDER BY 
    CASE s.experience_level 
        WHEN 'Advanced' THEN 1 
        WHEN 'Intermediate' THEN 2 
        ELSE 3 
    END;
