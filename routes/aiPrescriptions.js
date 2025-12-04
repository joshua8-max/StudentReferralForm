const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const aiPrescriptionController = require('../controllers/aiPrescriptionController');

// All routes require authentication
// Only Admin and Counselor/Staff can access AI prescriptions

// Check if prescription is allowed this week
router.get('/check-availability', verifyToken, aiPrescriptionController.checkAvailability);

// Get this week's prescription
router.get('/this-week', verifyToken, aiPrescriptionController.getThisWeek);

// Get all prescriptions history
router.get('/history', verifyToken, aiPrescriptionController.getHistory);

// Create new prescription (Admin and Counselor only)
router.post('/prescribe', verifyToken, aiPrescriptionController.createPrescription);

module.exports = router;
