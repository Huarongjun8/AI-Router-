const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { Company, QueryLog, CostSummary } = require('./models');
const QueryClassifier = require('./services/classifier');
const LLMRouter = require('./services/router');

const app = express();
const classifier = new QueryClassifier();
const router = new LLMRouter();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Key authentication
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const company = await Company.findOne({ apiKey });
  
  if (!company) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.company = company;
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main query endpoint - this is what employees use
app.post('/api/query', authenticateApiKey, async (req, res) => {
  try {
    const { query, userId, department, systemPrompt } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Classify query complexity
    const complexity = classifier.classify(query);
    
    // Select optimal model
    const selectedModel = classifier.selectModel(complexity, req.company.preferences);

    // Route to LLM
    const result = await router.routeQuery(query, selectedModel, systemPrompt);

    // Calculate cost
    const cost = router.calculateCost(result.usage, selectedModel.model);
    const savings = router.calculateSavings(cost, result.usage);

    // Log query
    const queryLog = new QueryLog({
      companyId: req.company._id,
      userId: userId || 'anonymous',
      department,
      query,
      queryLength: query.length,
      complexity,
      modelUsed: selectedModel.model,
      modelProvider: selectedModel.provider,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      cost,
      savingsVsGPT4: savings,
      latency: result.latency
    });

    await queryLog.save();

    // Update daily summary (async, don't wait)
    updateDailySummary(req.company._id, queryLog).catch(console.error);

    res.json({
      response: result.response,
      metadata: {
        model: selectedModel.model,
        provider: selectedModel.provider,
        complexity,
        cost: cost.toFixed(6),
        savings: savings.toFixed(6),
        latency: result.latency,
        tokens: {
          input: result.usage.inputTokens,
          output: result.usage.outputTokens,
          total: result.usage.totalTokens
        }
      }
    });

  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to process query', message: error.message });
  }
});

// Get analytics dashboard data
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    const filter = { companyId: req.user.companyId };
    
    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (department) {
      filter.department = department;
    }

    // Get aggregated data
    const [totalStats, modelBreakdown, dailyTrend] = await Promise.all([
      // Total stats
      QueryLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalQueries: { $sum: 1 },
            totalCost: { $sum: '$cost' },
            totalSavings: { $sum: '$savingsVsGPT4' },
            avgLatency: { $avg: '$latency' }
          }
        }
      ]),

      // Model breakdown
      QueryLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$modelUsed',
            queries: { $sum: 1 },
            cost: { $sum: '$cost' },
            avgLatency: { $avg: '$latency' }
          }
        }
      ]),

      // Daily trend
      QueryLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            queries: { $sum: 1 },
            cost: { $sum: '$cost' },
            savings: { $sum: '$savingsVsGPT4' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      summary: totalStats[0] || { totalQueries: 0, totalCost: 0, totalSavings: 0, avgLatency: 0 },
      modelBreakdown,
      dailyTrend
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get recent queries
app.get('/api/queries/recent', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const queries = await QueryLog.find({ 
      companyId: req.user.companyId 
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-query'); // Don't return actual query content for privacy

    res.json(queries);

  } catch (error) {
    console.error('Recent queries error:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Helper function to update daily summary
async function updateDailySummary(companyId, queryLog) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await CostSummary.findOneAndUpdate(
    { companyId, date: today },
    {
      $inc: {
        totalQueries: 1,
        totalCost: queryLog.cost,
        totalSavings: queryLog.savingsVsGPT4,
        [`modelBreakdown.${queryLog.modelUsed}.queries`]: 1,
        [`modelBreakdown.${queryLog.modelUsed}.cost`]: queryLog.cost
      }
    },
    { upsert: true }
  );
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AI Router API running on port ${PORT}`);
});

module.exports = app;
