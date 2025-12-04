const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Referral = require("../models/Referral");

// PUBLIC ROUTE - Student Form Submission (No Auth Required)
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
    // Using valid enum values: "JHS" for level (required by model)
    const newReferral = new Referral({
      studentName: studentName || 'Anonymous',
      studentId: 'PENDING',
      level: 'JHS',  // ✅ Valid enum value (Elementary, JHS, or SHS)
      grade: 'To Be Determined',  // ✅ Valid string (no enum restriction on grade)
      referralDate: new Date(),
      reason: concern.trim(),
      description: concern.trim(),
      severity: 'Medium',
      status: 'Pending',
      referredBy: 'Student Self-Report',
      createdBy: new mongoose.Types.ObjectId('000000000000000000000000')
    });

    const savedReferral = await newReferral.save();
    
    console.log("✅ Student concern submitted:", savedReferral.referralId);
    
    res.status(201).json({
      success: true,
      message: 'Concern submitted successfully',
      data: {
        referralId: savedReferral.referralId
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
