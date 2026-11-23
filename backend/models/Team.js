/**
 * Team & Membership Data Model
 */
class Team {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.projectId;
    this.teamName = data.teamName;
    this.leaderId = data.leaderId;
    this.status = data.status || 'FORMING';
    this.members = data.members || [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Team;
