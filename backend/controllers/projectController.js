/**
 * ============================================================================
 * PROJECTHUB AI - PROJECT CONTROLLER
 * Handles Active Projects, Cohort Visibility Enforcement, Recommendations, and Details.
 * ============================================================================
 */

const { memoryStore } = require('../config/db');
const { filterVisibleProjects, canUserAccessProject } = require('../services/visibilityService');
const { rankProjectsForStudent, calculateMatchPercentage } = require('../services/matchingService');

/**
 * Get Projects Visible to the Logged-in User
 * Enforces strict cohort isolation (Department + Year + Section) for students!
 */
const getVisibleProjects = (req, res) => {
  try {
    const user = req.user;
    const rawVisible = filterVisibleProjects(memoryStore.projects, user);

    // Enrich with live team counts and remaining slots
    const enriched = rawVisible.map(proj => {
      const teams = memoryStore.teams.filter(t => t.projectId === proj.id);
      const totalMembers = teams.reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);
      const remainingSlots = Math.max(0, proj.teamSize - totalMembers);

      // Compute student match score if user is a student
      let matchScore = 0;
      if (user && user.role === 'STUDENT') {
        const student = memoryStore.students.find(s => s.id === user.id);
        if (student) {
          matchScore = calculateMatchPercentage(student.skills || [], proj.requiredSkills || []);
        }
      }

      return {
        ...proj,
        currentMembers: totalMembers,
        remainingSlots,
        teamsCount: teams.length,
        matchScore
      };
    });

    return res.json({
      success: true,
      count: enriched.length,
      cohort: user.role === 'STUDENT' ? `${user.department} - Year ${user.year} - Sec ${user.section}` : 'ALL_COHORTS',
      projects: enriched
    });
  } catch (error) {
    console.error('Error fetching visible projects:', error);
    return res.status(500).json({ success: false, message: 'Failed to load projects.' });
  }
};

/**
 * Get AI-Recommended Projects for the Logged-in Student
 */
const getRecommendedProjects = (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'STUDENT') {
      return res.status(400).json({ success: false, message: 'Recommendations are for students.' });
    }

    const student = memoryStore.students.find(s => s.id === user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // First filter by strict cohort visibility
    const visibleProjects = filterVisibleProjects(memoryStore.projects, user);

    // Then rank by skill compatibility score
    const ranked = rankProjectsForStudent(student, visibleProjects);

    return res.json({
      success: true,
      count: ranked.length,
      studentSkills: student.skills,
      recommendedProjects: ranked
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate recommendations.' });
  }
};

/**
 * Get Project Details by ID
 */
const getProjectById = (req, res) => {
  try {
    const { id } = req.params;
    const project = memoryStore.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Verify visibility permission
    if (!canUserAccessProject(project, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This project is only visible to students in the assigned Department, Year, and Section.'
      });
    }

    // Fetch associated teams and progress
    const teams = memoryStore.teams.filter(t => t.projectId === project.id);
    const enrichedTeams = teams.map(t => {
      const progress = memoryStore.projectProgress.find(prog => prog.teamId === t.id);
      const membersWithDetails = t.members.map(m => {
        const student = memoryStore.students.find(s => s.id === m.studentId);
        return {
          ...m,
          name: student ? student.fullName : 'Unknown',
          avatarUrl: student ? student.avatarUrl : null,
          skills: student ? student.skills : []
        };
      });

      return {
        ...t,
        members: membersWithDetails,
        progress: progress || { status: 'NOT_STARTED', completionPercentage: 0 }
      };
    });

    return res.json({
      success: true,
      project: {
        ...project,
        teams: enrichedTeams
      }
    });
  } catch (error) {
    console.error('Error loading project details:', error);
    return res.status(500).json({ success: false, message: 'Failed to load project details.' });
  }
};

module.exports = {
  getVisibleProjects,
  getRecommendedProjects,
  getProjectById
};
