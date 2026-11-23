const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('STUDENT'), teamController.createTeam);
router.get('/my-teams', verifyToken, teamController.getMyTeams);
router.put('/:teamId/progress', verifyToken, teamController.updateTeamProgress);

module.exports = router;
