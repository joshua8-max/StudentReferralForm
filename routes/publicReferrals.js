const express = require("express");
const router = express.Router();
const StudentSubmission = require("../models/StudentSubmission");

// PUBLIC ROUTE - Student Form Submission (No Auth Required)
// This matches the frontend calling /api/public-referrals
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received student concern:", req.body);

    const { studentName, concern, nameOption } = req.body;

    // Validate input
    if (!concern || concern.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Concern is required' 
      });
    }

    // Generate unique submission ID
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the highest existing submission number for today
    const todayPattern = new RegExp(`^SUB-${dateStr}-`);
    const existingSubmissions = await StudentSubmission.find({
      submissionId: todayPattern
    }).sort({ submissionId: -1 }).limit(1);
    
    let nextNumber = 1;
    if (existingSubmissions.length > 0) {
      const lastId = existingSubmissions[0].submissionId;
      const lastNumber = parseInt(lastId.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const submissionId = `SUB-${dateStr}-${String(nextNumber).padStart(3, '0')}`;

    // Create new student submission
    const submission = new StudentSubmission({
      submissionId,
      studentName: studentName || 'Anonymous',
      concern: concern.trim(),
      nameOption: nameOption || 'preferNot',
      status: 'Pending'
    });

    await submission.save();
    
    console.log("✅ Student concern submitted:", submission.submissionId);
    
    res.status(201).json({
      success: true,
      message: 'Concern submitted successfully',
      data: {
        referralId: submission.submissionId  // Frontend expects "referralId"
      }
    });

  } catch (error) {
    console.error("❌ Error submitting student concern:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        error: 'Duplicate submission. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: error.message
    });
  }
});

module.exports = router;
