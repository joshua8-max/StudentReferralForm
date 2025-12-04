const express = require("express");
const router = express.Router();
const Referral = require("../models/Referral");

// PUBLIC ROUTE - Student Form Submission
router.post("/", async (req, res) => {
  try {
    console.log("📥 Received:", req.body);

    const { studentName, concern, nameOption } = req.body;

    if (!concern || !concern.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Concern is required' 
      });
    }

    // Simple referral creation
    const referral = new Referral({
      studentName: studentName || 'Anonymous',
      studentId: 'PENDING',
      level: 'N/A',
      grade: 'N/A', 
      referralDate: new Date(),
      reason: concern.trim(),
      description: concern.trim(),
      severity: 'Medium',
      status: 'Pending',
      referredBy: 'Student Self-Report'
    });

    const saved = await referral.save();
    
    console.log("✅ Saved:", saved.referralId);
    
    res.status(201).json({
      success: true,
      message: 'Success',
      data: { referralId: saved.referralId }
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
});

module.exports = router;
