/**
 * Admin Data Model
 */
class Admin {
  constructor(data) {
    this.id = data.id;
    this.fullName = data.fullName;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.department = data.department;
    this.role = data.role || 'FACULTY_ADMIN';
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Admin;
