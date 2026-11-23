/**
 * ============================================================================
 * PROJECTHUB AI - AUTHENTICATION CONTROLLER
 * Handles Student Registration, Student Login, Admin Login, and Session Check.
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { memoryStore, uuidv4 } = require('../config/db');

/**
 * Generate standard JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

/**
 * STUDENT REGISTRATION
 * Fields: Full Name, USN, Email, Department, Year, Section, Skills, Experience Level, Password, Confirm Password
 */
const registerStudent = (req, res) => {
  try {
    const {
      fullName,
      usn,
      email,
      department,
      year,
      section,
      skills,
      experienceLevel,
      password,
      confirmPassword,
      bio
    } = req.body;

    // Validation
    if (!fullName || !usn || !email || !department || !year || !section || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required registration credentials.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check unique constraints
    const existingUsn = memoryStore.students.find(s => s.usn.toUpperCase() === usn.toUpperCase());
    if (existingUsn) {
      return res.status(400).json({
        success: false,
        message: `A student with USN ${usn} is already registered.`
      });
    }

    const existingEmail = memoryStore.students.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `A student with email ${email} is already registered.`
      });
    }

    // Create New Student Entity
    const newStudent = {
      id: `stu-${uuidv4().substring(0, 8)}`,
      usn: usn.toUpperCase(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // In production, bcrypt.hashSync(password, 10)
      department: department.toUpperCase(),
      year: parseInt(year),
      section: section.toUpperCase(),
      experienceLevel: experienceLevel || 'Beginner',
      bio: bio || 'Aspiring engineer passionate about collaborative building.',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`,
      availabilityStatus: 'AVAILABLE',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : [])
    };

    memoryStore.students.push(newStudent);

    // Generate Token
    const token = generateToken({
      id: newStudent.id,
      usn: newStudent.usn,
      email: newStudent.email,
      fullName: newStudent.fullName,
      role: 'STUDENT',
      department: newStudent.department,
      year: newStudent.year,
      section: newStudent.section
    });

    return res.status(201).json({
      success: true,
      message: 'Student account successfully created! Welcome to ProjectHub AI.',
      token,
      user: {
        id: newStudent.id,
        usn: newStudent.usn,
        fullName: newStudent.fullName,
        email: newStudent.email,
        department: newStudent.department,
        year: newStudent.year,
        section: newStudent.section,
        experienceLevel: newStudent.experienceLevel,
        skills: newStudent.skills,
        role: 'STUDENT'
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server registration error.' });
  }
};

/**
 * STUDENT LOGIN
 * Fields: USN or Email, Password
 */
const loginStudent = (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be USN or Email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your USN or Email and Password.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const student = memoryStore.students.find(s => 
      s.email.toLowerCase() === cleanIdentifier || 
      s.usn.toLowerCase() === cleanIdentifier
    );

    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: No student account found with this identifier.'
      });
    }

    // In production: bcrypt.compareSync(password, student.passwordHash)
    // For demo flexibility, matches password or seed hash
    const isMatch = password === 'Password@123' || password === student.passwordHash;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. (Tip: Demo password is Password@123)'
      });
    }

    const token = generateToken({
      id: student.id,
      usn: student.usn,
      email: student.email,
      fullName: student.fullName,
      role: 'STUDENT',
      department: student.department,
      year: student.year,
      section: student.section
    });

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: student.id,
        usn: student.usn,
        fullName: student.fullName,
        email: student.email,
        department: student.department,
        year: student.year,
        section: student.section,
        experienceLevel: student.experienceLevel,
        skills: student.skills,
        avatarUrl: student.avatarUrl,
        bio: student.bio,
        role: 'STUDENT'
      }
    });
  } catch (error) {
    console.error('Student Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server login error.' });
  }
};

/**
 * ADMIN LOGIN
 * Fields: Email, Password
 */
const loginAdmin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide admin email and password.'
      });
    }

    const admin = memoryStore.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'No administrative account found with this email address.'
      });
    }

    const isMatch = password === 'Password@123' || password === admin.passwordHash;
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password. (Tip: Demo password is Password@123)'
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: 'ADMIN',
      department: admin.department
    });

    return res.json({
      success: true,
      message: 'Admin access authorized.',
      token,
      user: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        department: admin.department,
        role: 'ADMIN'
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server admin login error.' });
  }
};

/**
 * Get Current Authenticated Profile
 */
const getMe = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  if (user.role === 'ADMIN') {
    const admin = memoryStore.admins.find(a => a.id === user.id);
    return res.json({ success: true, user: { ...admin, role: 'ADMIN' } });
  } else {
    const student = memoryStore.students.find(s => s.id === user.id);
    return res.json({ success: true, user: { ...student, role: 'STUDENT' } });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  getMe
};
