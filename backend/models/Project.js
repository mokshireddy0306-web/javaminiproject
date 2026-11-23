/**
 * Project Data Model
 */
class Project {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.department = data.department;
    this.year = data.year;
    this.section = data.section;
    this.deadline = data.deadline;
    this.teamSize = data.teamSize || 4;
    this.priority = data.priority || 'MEDIUM';
    this.status = data.status || 'PUBLISHED';
    this.requiredSkills = data.requiredSkills || [];
    this.createdByAdminId = data.createdByAdminId;
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Project;
