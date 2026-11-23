const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('STUDENT'), queryController.raiseQuery);
router.get('/', verifyToken, queryController.getQueries);
router.put('/:queryId/reply', verifyToken, requireRole('ADMIN'), queryController.replyQuery);

module.exports = router;
