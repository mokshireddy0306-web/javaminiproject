const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken } = require('../middleware/auth');

router.get('/visible', verifyToken, projectController.getVisibleProjects);
router.get('/recommended', verifyToken, projectController.getRecommendedProjects);
router.get('/:id', verifyToken, projectController.getProjectById);

module.exports = router;
