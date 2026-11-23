/**
 * ============================================================================
 * PROJECTHUB AI - ADMIN CONTROLLER
 * Executive Operations: Project Creation with Cohort Rules, Deletion, and Analytics.
 * ============================================================================
 */

const { memoryStore, uuidv4 } = require('../config/db');
const { getPlatformAnalytics } = require('../services/analyticsService');

/**
 * Get Comprehensive Admin Analytics KPIs
 */
const getAnalytics = (req, res) => {
  try {
    const analytics = getPlatformAnalytics();
    return res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load analytics.' });
  }
};

/**
 * Create a New Project (Admin)
 * Fields: Project Name, Description, Department, Year, Section, Required Skills, Deadline, Team Size, Priority, Status
 */
const createProject = (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = memoryStore.admins.find(a => a.id === adminId);

    const {
      title,
      description,
      department,
      year,
      section,
      requiredSkills,
      deadline,
      teamSize,
      priority,
      status
    } = req.body;

    if (!title || !description || !department || !year || !section || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory project parameters (Title, Description, Department, Year, Section, Deadline).'
      });
    }

    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []);

    const newProject = {
      id: `proj-${uuidv4().substring(0, 8)}`,
      title: title.trim(),
      description: description.trim(),
      department: department.toUpperCase(),
      year: parseInt(year),
      section: section.toUpperCase(),
      requiredSkills: skillsArray,
      deadline,
      teamSize: parseInt(teamSize) || 4,
      priority: priority || 'MEDIUM',
      status: status || 'PUBLISHED', // 'PUBLISHED', 'DRAFT', etc.
      createdByAdminId: adminId,
      facultyCreator: admin ? admin.fullName : 'Faculty Administrator',
      createdAt: new Date().toISOString()
    };

    memoryStore.projects.push(newProject);

    return res.status(201).json({
      success: true,
      message: `Project "${newProject.title}" created successfully for ${newProject.department} Year ${newProject.year} Sec ${newProject.section}.`,
      project: newProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ success: false, message: 'Failed to create project.' });
  }
};

/**
 * Update Project
 */
const updateProject = (req, res) => {
  try {
    const { id } = req.params;
    const project = memoryStore.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const {
      title,
      description,
      department,
      year,
      section,
      requiredSkills,
      deadline,
      teamSize,
      priority,
      status
    } = req.body;

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (department) project.department = department.toUpperCase();
    if (year) project.year = parseInt(year);
    if (section) project.section = section.toUpperCase();
    if (deadline) project.deadline = deadline;
    if (teamSize) project.teamSize = parseInt(teamSize);
    if (priority) project.priority = priority;
    if (status) project.status = status;
    if (requiredSkills) {
      project.requiredSkills = Array.isArray(requiredSkills) 
        ? requiredSkills 
        : requiredSkills.split(',').map(s => s.trim());
    }

    project.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Project updated successfully.',
      project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
};

/**
 * Delete Project
 */
const deleteProject = (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryStore.projects.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const deleted = memoryStore.projects.splice(index, 1)[0];

    // Remove associated teams and requests
    memoryStore.teams = memoryStore.teams.filter(t => t.projectId !== id);
    memoryStore.requests = memoryStore.requests.filter(r => r.projectId !== id);
    memoryStore.projectProgress = memoryStore.projectProgress.filter(p => p.projectId !== id);

    return res.json({
      success: true,
      message: `Project "${deleted.title}" and associated teams removed.`
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
};

module.exports = {
  getAnalytics,
  createProject,
  updateProject,
  deleteProject
};
