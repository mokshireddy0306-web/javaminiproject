const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');

router.get('/available', verifyToken, studentController.getAvailableStudents);
router.get('/:id', verifyToken, studentController.getStudentById);
router.put('/profile', verifyToken, studentController.updateProfile);

module.exports = router;
