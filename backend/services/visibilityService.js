/**
 * ============================================================================
 * PROJECTHUB AI - COHORT VISIBILITY SERVICE
 * Enforces strict multi-tenant isolation by Department, Academic Year, & Section.
 * ============================================================================
 */

/**
 * Filter projects that the specified user has authorization to view.
 * 
 * Visibility Rules:
 * 1. Admin / Faculty: Can view all projects across all departments.
 * 2. Student: Can ONLY view projects where:
 *      Project.Department === Student.Department
 *      AND Project.Year === Student.Year
 *      AND Project.Section === Student.Section
 *      AND Project.Status === 'PUBLISHED'
 * 
 * @param {Array<Object>} projects 
 * @param {Object} user 
 * @returns {Array<Object>}
 */
function filterVisibleProjects(projects, user) {
  if (!user) return [];

  // Admins have unrestricted global visibility
  if (user.role === 'ADMIN') {
    return projects;
  }

  // Strict Cohort Isolation for Students
  return projects.filter(project => {
    const isPublished = project.status === 'PUBLISHED';
    const isSameDept = project.department.toUpperCase() === user.department.toUpperCase();
    const isSameYear = parseInt(project.year) === parseInt(user.year);
    const isSameSec = project.section.toUpperCase() === user.section.toUpperCase();

    return isPublished && isSameDept && isSameYear && isSameSec;
  });
}

/**
 * Verify if student can access a specific single project details
 * @param {Object} project 
 * @param {Object} user 
 * @returns {boolean}
 */
function canUserAccessProject(project, user) {
  if (!user || !project) return false;
  if (user.role === 'ADMIN') return true;

  return (
    project.status === 'PUBLISHED' &&
    project.department.toUpperCase() === user.department.toUpperCase() &&
    parseInt(project.year) === parseInt(user.year) &&
    project.section.toUpperCase() === user.section.toUpperCase()
  );
}

module.exports = {
  filterVisibleProjects,
  canUserAccessProject
};
