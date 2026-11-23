/**
 * ============================================================================
 * PROJECTHUB AI - AUTHENTICATION & ROLE-BASED ACCESS MIDDLEWARE
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Verify JWT Token from Authorization Header
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No Authorization header provided.'
    });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // { id, email, role, department, year, section }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

/**
 * Require specific role (e.g. 'STUDENT' or 'ADMIN')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${roles.join(' or ')}.`
      });
    }
    next();
  };
};

/**
 * Check if the student belongs to the required cohort (Department, Year, Section)
 * Admins bypass this restriction.
 */
const checkCohortAccess = (project, user) => {
  if (user.role === 'ADMIN') return true;
  return (
    project.department === user.department &&
    parseInt(project.year) === parseInt(user.year) &&
    project.section.toUpperCase() === user.section.toUpperCase()
  );
};

module.exports = {
  verifyToken,
  requireRole,
  checkCohortAccess
};
