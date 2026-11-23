/**
 * ============================================================================
 * PROJECTHUB AI - ADMIN ANALYTICS SERVICE
 * Real-time operational intelligence, KPI metrics, and chart aggregation.
 * ============================================================================
 */

const { memoryStore } = require('../config/db');

/**
 * Compute executive dashboard metrics
 * @returns {Object}
 */
function getPlatformAnalytics() {
  const totalProjects = memoryStore.projects.length;
  const activeProjects = memoryStore.projects.filter(p => p.status === 'PUBLISHED').length;
  const registeredStudents = memoryStore.students.length;
  const teamsFormed = memoryStore.teams.length;
  const pendingStudents = memoryStore.students.filter(s => s.availabilityStatus === 'AVAILABLE').length;
  const completedProjects = memoryStore.projectProgress.filter(p => p.status === 'COMPLETED').length;
  const openQueries = memoryStore.queries.filter(q => q.status === 'OPEN').length;

  // Department distribution
  const departmentStats = {};
  memoryStore.students.forEach(s => {
    departmentStats[s.department] = (departmentStats[s.department] || 0) + 1;
  });

  // Project Progress Breakdown
  const progressBreakdown = {
    NOT_STARTED: 0,
    PLANNING: 0,
    DEVELOPMENT: 0,
    TESTING: 0,
    DEPLOYMENT: 0,
    COMPLETED: 0
  };
  memoryStore.projectProgress.forEach(p => {
    if (progressBreakdown[p.status] !== undefined) {
      progressBreakdown[p.status]++;
    }
  });

  // Skill demand count
  const skillDemand = {};
  memoryStore.projects.forEach(p => {
    (p.requiredSkills || []).forEach(skill => {
      skillDemand[skill] = (skillDemand[skill] || 0) + 1;
    });
  });

  return {
    kpis: {
      totalProjects,
      activeProjects,
      registeredStudents,
      teamsFormed,
      pendingStudents,
      completedProjects,
      openQueries
    },
    departmentStats,
    progressBreakdown,
    skillDemand
  };
}

module.exports = {
  getPlatformAnalytics
};
