const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, requestController.sendRequest);
router.get('/my-requests', verifyToken, requestController.getMyRequests);
router.put('/:requestId/accept', verifyToken, requestController.acceptRequest);
router.put('/:requestId/reject', verifyToken, requestController.rejectRequest);

module.exports = router;
