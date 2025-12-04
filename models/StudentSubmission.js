const mongoose = require('mongoose');

const studentSubmissionSchema = new mongoose.Schema({
  submissionId: {
    type: String,
    unique: true
  },
  studentName: {
    type: String,
    default: 'Anonymous'
  },
  concern: {
    type: String,
    required: true
  },
  studentNameOption: {
    type: String,
    enum: ['realName', 'anonymous', 'preferNot'],
    default: 'preferNot'
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved', 'Closed'],
    default: 'Pending'
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

studentSubmissionSchema.pre('save', async function(next) {
  if (!this.submissionId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    const lastSubmission = await this.constructor
      .findOne({ submissionId: new RegExp(`^SUB-${dateStr}`) })
      .sort({ submissionId: -1 });
    
    let sequence = 1;
    if (lastSubmission) {
      const lastSequence = parseInt(lastSubmission.submissionId.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.submissionId = `SUB-${dateStr}-${String(sequence).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('StudentSubmission', studentSubmissionSchema);

