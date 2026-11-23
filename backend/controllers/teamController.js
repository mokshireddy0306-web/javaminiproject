/**
 * ============================================================================
 * PROJECTHUB AI - TEAM CONTROLLER
 * Manages Team Creation, Membership Roster, Progress Milestones, and Disbanding.
 * ============================================================================
 */

const { memoryStore, uuidv4 } = require('../config/db');

/**
 * Create a new team for a project
 */
const createTeam = (req, res) => {
  try {
    const studentId = req.user.id;
    const { projectId, teamName } = req.body;

    if (!projectId || !teamName) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and Team Name are required.'
      });
    }

    const project = memoryStore.projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check if student already leads or belongs to a team for this project
    const existingTeam = memoryStore.teams.find(t => 
      t.projectId === projectId && t.members.some(m => m.studentId === studentId)
    );
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a team for this project.'
      });
    }

    const newTeam = {
      id: `team-${uuidv4().substring(0, 8)}`,
      projectId,
      teamName: teamName.trim(),
      leaderId: studentId,
      status: 'FORMING',
      members: [
        {
          studentId,
          role: 'Leader & Full-Stack Architect',
          joinedAt: new Date().toISOString()
        }
      ]
    };

    memoryStore.teams.push(newTeam);

    // Initialize progress entry
    const progressEntry = {
      id: `prog-${uuidv4().substring(0, 8)}`,
      projectId,
      teamId: newTeam.id,
      status: 'PLANNING',
      completionPercentage: 10,
      currentMilestone: 'Project Scope & Team Formation',
      milestoneDeadline: project.deadline,
      notes: 'Initial team formed and registered.',
      updatedAt: new Date().toISOString()
    };
    memoryStore.projectProgress.push(progressEntry);

    return res.status(201).json({
      success: true,
      message: 'Team registered successfully.',
      team: newTeam,
      progress: progressEntry
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ success: false, message: 'Failed to create team.' });
  }
};

/**
 * Get teams associated with the logged-in student
 */
const getMyTeams = (req, res) => {
  try {
    const studentId = req.user.id;
    const myTeams = memoryStore.teams.filter(t => 
      t.members.some(m => m.studentId === studentId)
    );

    const enriched = myTeams.map(t => {
      const project = memoryStore.projects.find(p => p.id === t.projectId);
      const progress = memoryStore.projectProgress.find(p => p.teamId === t.id);
      
      const detailedMembers = t.members.map(m => {
        const student = memoryStore.students.find(s => s.id === m.studentId);
        return {
          ...m,
          name: student ? student.fullName : 'Unknown',
          email: student ? student.email : '',
          avatarUrl: student ? student.avatarUrl : null,
          skills: student ? student.skills : []
        };
      });

      return {
        ...t,
        projectTitle: project ? project.title : 'Project',
        projectDeadline: project ? project.deadline : '',
        teamSizeLimit: project ? project.teamSize : 4,
        members: detailedMembers,
        progress: progress || { status: 'NOT_STARTED', completionPercentage: 0 }
      };
    });

    return res.json({
      success: true,
      count: enriched.length,
      teams: enriched
    });
  } catch (error) {
    console.error('Error getting my teams:', error);
    return res.status(500).json({ success: false, message: 'Failed to load your teams.' });
  }
};

/**
 * Update Project Progress Status & Milestones
 */
const updateTeamProgress = (req, res) => {
  try {
    const { teamId } = req.params;
    const { status, completionPercentage, currentMilestone, notes } = req.body;

    const team = memoryStore.teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // Only team leader or admin can update
    if (req.user.role !== 'ADMIN' && team.leaderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the team leader or an admin can update project milestones.'
      });
    }

    let progress = memoryStore.projectProgress.find(p => p.teamId === teamId);
    if (!progress) {
      progress = {
        id: `prog-${uuidv4().substring(0, 8)}`,
        projectId: team.projectId,
        teamId,
        status: 'PLANNING',
        completionPercentage: 0,
        updatedAt: new Date().toISOString()
      };
      memoryStore.projectProgress.push(progress);
    }

    if (status) progress.status = status;
    if (completionPercentage !== undefined) progress.completionPercentage = parseInt(completionPercentage);
    if (currentMilestone) progress.currentMilestone = currentMilestone;
    if (notes) progress.notes = notes;
    progress.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Milestone progress updated.',
      progress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
};

module.exports = {
  createTeam,
  getMyTeams,
  updateTeamProgress
};
