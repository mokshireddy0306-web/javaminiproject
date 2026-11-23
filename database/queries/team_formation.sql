-- ============================================================================
-- TEAM FORMATION & MANAGEMENT QUERIES
-- Manages team creation, membership validation, remaining vacancies,
-- and request workflows (Invite/Join).
-- ============================================================================

-- Query 1: Get Team Details with Full Member Roster and Vacancies
-- Parameters: :team_id
SELECT 
    t.id AS team_id,
    t.team_name,
    t.status AS team_status,
    p.id AS project_id,
    p.title AS project_title,
    p.team_size AS max_team_size,
    COUNT(tm.id) AS current_member_count,
    (p.team_size - COUNT(tm.id)) AS slots_remaining,
    s_lead.full_name AS team_leader_name,
    s_lead.email AS team_leader_email
FROM teams t
JOIN projects p ON t.project_id = p.id
JOIN students s_lead ON t.leader_id = s_lead.id
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.id = :team_id
GROUP BY t.id, p.id, s_lead.full_name, s_lead.email;

-- Query 2: List All Members in a Specific Team with Their Skills
-- Parameters: :team_id
SELECT 
    tm.id AS membership_id,
    tm.role,
    tm.joined_at,
    s.id AS student_id,
    s.usn,
    s.full_name,
    s.email,
    s.experience_level,
    s.avatar_url,
    STRING_AGG(DISTINCT sk.name, ', ') AS skill_summary
FROM team_members tm
JOIN students s ON tm.student_id = s.id
LEFT JOIN student_skills ssk ON s.id = ssk.student_id
LEFT JOIN skills sk ON ssk.skill_id = sk.id
WHERE tm.team_id = :team_id
GROUP BY tm.id, s.id
ORDER BY tm.joined_at ASC;

-- Query 3: Check If Team Is Full Before Accepting New Member
-- Parameters: :team_id
SELECT 
    t.id AS team_id,
    p.team_size,
    COUNT(tm.id) AS current_members,
    CASE 
        WHEN COUNT(tm.id) >= p.team_size THEN TRUE 
        ELSE FALSE 
    END AS is_team_full
FROM teams t
JOIN projects p ON t.project_id = p.id
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.id = :team_id
GROUP BY t.id, p.team_size;
