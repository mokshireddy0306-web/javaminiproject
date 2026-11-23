const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All admin routes require ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

router.get('/analytics', adminController.getAnalytics);
router.post('/projects', adminController.createProject);
router.put('/projects/:id', adminController.updateProject);
router.delete('/projects/:id', adminController.deleteProject);

module.exports = router;
