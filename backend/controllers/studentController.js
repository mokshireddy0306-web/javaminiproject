/**
 * ============================================================================
 * PROJECTHUB AI - STUDENT CONTROLLER
 * Available Students directory with advanced filtering, profiles, and skill updates.
 * ============================================================================
 */

const { memoryStore } = require('../config/db');

/**
 * Get Available Students with Advanced Filters
 * Filters: department, skills, experience, availability, search
 */
const getAvailableStudents = (req, res) => {
  try {
    const { department, skill, experience, availability, search } = req.query;
    let students = [...memoryStore.students];

    // Exclude current student from their own discover list if logged in
    if (req.user && req.user.role === 'STUDENT') {
      students = students.filter(s => s.id !== req.user.id);
    }

    // Filter by Department
    if (department) {
      students = students.filter(s => s.department.toUpperCase() === department.toUpperCase());
    }

    // Filter by Specific Skill
    if (skill) {
      students = students.filter(s => 
        (s.skills || []).some(sk => sk.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    // Filter by Experience Level
    if (experience) {
      students = students.filter(s => s.experienceLevel.toLowerCase() === experience.toLowerCase());
    }

    // Filter by Availability Status
    if (availability) {
      students = students.filter(s => s.availabilityStatus.toUpperCase() === availability.toUpperCase());
    }

    // Text Search (Name, USN, Bio)
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s => 
        s.fullName.toLowerCase().includes(q) ||
        s.usn.toLowerCase().includes(q) ||
        (s.bio && s.bio.toLowerCase().includes(q))
      );
    }

    // Sanitize output (omit password hash)
    const sanitized = students.map(s => ({
      id: s.id,
      usn: s.usn,
      fullName: s.fullName,
      email: s.email,
      department: s.department,
      year: s.year,
      section: s.section,
      experienceLevel: s.experienceLevel,
      bio: s.bio,
      avatarUrl: s.avatarUrl,
      availabilityStatus: s.availabilityStatus,
      skills: s.skills
    }));

    return res.json({
      success: true,
      count: sanitized.length,
      students: sanitized
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ success: false, message: 'Failed to load students.' });
  }
};

/**
 * Get Student Profile by ID
 */
const getStudentById = (req, res) => {
  const { id } = req.params;
  const student = memoryStore.students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  // Find teams the student belongs to
  const teams = memoryStore.teams.filter(t => 
    t.members.some(m => m.studentId === student.id)
  );

  return res.json({
    success: true,
    student: {
      id: student.id,
      usn: student.usn,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      year: student.year,
      section: student.section,
      experienceLevel: student.experienceLevel,
      bio: student.bio,
      avatarUrl: student.avatarUrl,
      availabilityStatus: student.availabilityStatus,
      skills: student.skills,
      teams: teams.map(t => ({ id: t.id, name: t.teamName, projectId: t.projectId }))
    }
  });
};

/**
 * Update Current Student Profile & Skills
 */
const updateProfile = (req, res) => {
  const studentId = req.user.id;
  const student = memoryStore.students.find(s => s.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  const { bio, experienceLevel, skills, availabilityStatus } = req.body;

  if (bio !== undefined) student.bio = bio;
  if (experienceLevel !== undefined) student.experienceLevel = experienceLevel;
  if (availabilityStatus !== undefined) student.availabilityStatus = availabilityStatus;
  if (skills !== undefined) {
    student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  }

  return res.json({
    success: true,
    message: 'Profile successfully updated.',
    student: {
      id: student.id,
      usn: student.usn,
      fullName: student.fullName,
      email: student.email,
      department: student.department,
      year: student.year,
      section: student.section,
      experienceLevel: student.experienceLevel,
      bio: student.bio,
      availabilityStatus: student.availabilityStatus,
      skills: student.skills
    }
  });
};

module.exports = {
  getAvailableStudents,
  getStudentById,
  updateProfile
};
