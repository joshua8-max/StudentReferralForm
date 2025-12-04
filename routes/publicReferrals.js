const express = require("express");
const router = express.Router();
const Referral = require("../models/Referral");

// PUBLIC ROUTE - Student Form Submission (No Auth Required)
// TEMPORARY: Using Referral model until StudentSubmission is fixed
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

    // Create new referral from student submission
    const mongoose = require('mongoose');
    
    const newReferral = new Referral({
      studentName: studentName || 'Anonymous',
      studentId: 'PENDING',
      level: 'N/A',
      grade: 'N/A',
      referralDate: new Date(),
      reason: concern,
      description: concern,
      severity: 'Medium',
      status: 'Pending',
      studentNameOption: nameOption || 'preferNot',
      createdBy: new mongoose.Types.ObjectId('000000000000000000000000'),
      referredBy: 'Student Self-Report'
    });

    const savedReferral = await newReferral.save();
    
    console.log("✅ Student concern submitted:", savedReferral.referralId);
    
    res.status(201).json({
      success: true,
      message: 'Concern submitted successfully',
      data: {
        referralId: savedReferral.referralId  // Returns REF-xxx format
      }
    });

  } catch (error) {
    console.error("❌ Error submitting student concern:", error);
    res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      details: error.message
    });
  }
});

module.exports = router;
