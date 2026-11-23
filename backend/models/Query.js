/**
 * Query Data Model
 */
class Query {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.projectId = data.projectId || null;
    this.subject = data.subject;
    this.queryText = data.queryText;
    this.category = data.category || 'TECHNICAL';
    this.adminReply = data.adminReply || null;
    this.status = data.status || 'OPEN';
    this.repliedByAdminId = data.repliedByAdminId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Query;
