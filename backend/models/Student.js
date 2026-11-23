/**
 * Student Data Model
 */
class Student {
  constructor(data) {
    this.id = data.id;
    this.usn = data.usn;
    this.fullName = data.fullName;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.department = data.department;
    this.year = data.year;
    this.section = data.section;
    this.experienceLevel = data.experienceLevel || 'Beginner';
    this.bio = data.bio || '';
    this.avatarUrl = data.avatarUrl || null;
    this.availabilityStatus = data.availabilityStatus || 'AVAILABLE';
    this.skills = data.skills || [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Student;
