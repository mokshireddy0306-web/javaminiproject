/**
 * Request Data Model (Join / Invite)
 */
class Request {
  constructor(data) {
    this.id = data.id;
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.teamId = data.teamId;
    this.projectId = data.projectId;
    this.type = data.type; // 'JOIN_TEAM' | 'INVITE_STUDENT'
    this.status = data.status || 'PENDING';
    this.message = data.message || '';
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Request;
