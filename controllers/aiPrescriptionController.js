const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

class AIPrescriptionController {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.historyFile = path.join(__dirname, '../database/prescription-history.json');
    this.loadHistory();
  }

  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        this.history = JSON.parse(data);
      } else {
        this.history = {
          prescriptions: [],
          currentWeek: null,
          weekStartDate: null
        };
        this.saveHistory();
      }
    } catch (error) {
      console.error('Error loading prescription history:', error);
      this.history = { prescriptions: [], currentWeek: null, weekStartDate: null };
    }
  }

  saveHistory() {
    try {
      const dir = path.dirname(this.historyFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
    } catch (error) {
      console.error('Error saving prescription history:', error);
    }
  }

  getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return {
      week: weekNumber,
      year: now.getFullYear(),
      key: `${now.getFullYear()}-W${weekNumber}`
    };
  }

  getWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  }

  canPrescribeThisWeek() {
    const currentWeek = this.getCurrentWeek();
    const lastPrescription = this.history.prescriptions[this.history.prescriptions.length - 1];

    if (!lastPrescription) {
      return { allowed: true, reason: 'first_prescription' };
    }

    if (lastPrescription.weekKey === currentWeek.key) {
      const { monday, sunday } = this.getWeekDates();
      const nextAvailable = new Date(sunday);
      nextAvailable.setDate(nextAvailable.getDate() + 1);
      
      return {
        allowed: false,
        reason: 'already_prescribed_this_week',
        lastPrescriptionDate: new Date(lastPrescription.timestamp),
        nextAvailableDate: nextAvailable,
        currentWeekStart: monday,
        currentWeekEnd: sunday
      };
    }

    return { allowed: true, reason: 'new_week' };
  }

  getTimeUntilNext() {
    const { sunday } = this.getWeekDates();
    const nextMonday = new Date(sunday);
    nextMonday.setDate(nextMonday.getDate() + 1);
    nextMonday.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const diff = nextMonday - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, nextMonday };
  }

  async prescribeSolution(issue, context = {}, userId = null) {
    const permission = this.canPrescribeThisWeek();

    if (!permission.allowed) {
      const timeUntil = this.getTimeUntilNext();
      return {
        success: false,
        blocked: true,
        reason: 'weekly_limit_reached',
        message: 'A prescription has already been created this week.',
        lastPrescriptionDate: permission.lastPrescriptionDate,
        nextAvailableDate: permission.nextAvailableDate,
        timeUntilNext: timeUntil,
        currentWeek: {
          start: permission.currentWeekStart,
          end: permission.currentWeekEnd
        }
      };
    }

    const prompt = this.buildPrompt(issue, context);

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const solutionText = response.content[0].text;
      const cleanedText = solutionText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const solution = JSON.parse(cleanedText);

      const currentWeek = this.getCurrentWeek();
      const prescription = {
        issue: issue,
        context: context,
        solution: solution,
        timestamp: new Date().toISOString(),
        weekKey: currentWeek.key,
        week: currentWeek.week,
        year: currentWeek.year,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        cost: this.calculateCost(response.usage),
        createdBy: userId
      };

      this.history.prescriptions.push(prescription);
      this.history.currentWeek = currentWeek.key;
      this.history.weekStartDate = this.getWeekDates().monday.toISOString();
      this.saveHistory();

      return {
        success: true,
        issue: issue,
        solution: solution,
        timestamp: prescription.timestamp,
        weekInfo: {
          week: currentWeek.week,
          year: currentWeek.year,
          key: currentWeek.key
        },
        nextPrescriptionAvailable: this.getTimeUntilNext().nextMonday
      };

    } catch (error) {
      console.error('Error prescribing solution:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildPrompt(issue, context) {
    const contextInfo = Object.keys(context).length > 0 
      ? `\nContext: ${JSON.stringify(context)}`
      : '';

    return `You are an expert school counselor and problem-solving advisor. Analyze this weekly trending issue among students and provide BRIEF, actionable solutions.

TRENDING ISSUE THIS WEEK: ${issue}${contextInfo}

Respond with ONLY valid JSON in this format:

{
  "severity": "low|medium|high",
  "root_cause": "Main cause in 1-2 sentences",
  "solutions": [
    {
      "title": "Solution name (3-5 words)",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "impact": "Expected outcome in 1 sentence"
    }
  ],
  "quick_wins": ["Quick fix 1", "Quick fix 2"]
}

Provide 2-3 solutions. Keep it concise and actionable. Focus on school/student context.`;
  }

  calculateCost(usage) {
    const inputCost = (usage.input_tokens / 1000000) * 3;
    const outputCost = (usage.output_tokens / 1000000) * 15;
    return (inputCost + outputCost).toFixed(4);
  }

  getThisWeekPrescription() {
    const currentWeek = this.getCurrentWeek();
    return this.history.prescriptions.find(p => p.weekKey === currentWeek.key);
  }

  getAllPrescriptions() {
    return this.history.prescriptions.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // Express route handlers
  async checkAvailability(req, res) {
    try {
      const permission = this.canPrescribeThisWeek();
      
      if (!permission.allowed) {
        const timeUntil = this.getTimeUntilNext();
        return res.json({
          allowed: false,
          lastPrescriptionDate: permission.lastPrescriptionDate,
          nextAvailableDate: permission.nextAvailableDate,
          currentWeek: {
            start: permission.currentWeekStart,
            end: permission.currentWeekEnd
          },
          timeUntilNext: timeUntil
        });
      }

      res.json({
        allowed: true,
        reason: permission.reason
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getThisWeek(req, res) {
    try {
      const prescription = this.getThisWeekPrescription();
      
      if (prescription) {
        res.json({
          success: true,
          prescription: prescription
        });
      } else {
        res.json({
          success: false,
          message: 'No prescription for this week yet'
        });
      }
    } catch (error) {
      console.error('Error getting this week:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getHistory(req, res) {
    try {
      const prescriptions = this.getAllPrescriptions();
      res.json({
        success: true,
        prescriptions: prescriptions,
        total: prescriptions.length
      });
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async createPrescription(req, res) {
    try {
      const { issue, context } = req.body;
      const userId = req.user?.id; // From auth middleware

      if (!issue) {
        return res.status(400).json({
          success: false,
          error: 'Issue description is required'
        });
      }

      const result = await this.prescribeSolution(issue, context || {}, userId);
      res.json(result);

    } catch (error) {
      console.error('Error creating prescription:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

// Create singleton instance
const aiPrescriptionController = new AIPrescriptionController();

module.exports = {
  checkAvailability: (req, res) => aiPrescriptionController.checkAvailability(req, res),
  getThisWeek: (req, res) => aiPrescriptionController.getThisWeek(req, res),
  getHistory: (req, res) => aiPrescriptionController.getHistory(req, res),
  createPrescription: (req, res) => aiPrescriptionController.createPrescription(req, res),
};
