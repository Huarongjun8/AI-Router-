const mongoose = require('mongoose');

// Company Schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true
  },
  preferences: {
    preferredProviders: {
      type: [String],
      default: ['openai', 'anthropic', 'google']
    },
    maxCostPerQuery: {
      type: Number,
      default: 0.1
    },
    prioritizeSpeed: {
      type: Boolean,
      default: false
    },
    prioritizeCost: {
      type: Boolean,
      default: true
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    queryLimit: {
      type: Number,
      default: 1000
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Query Log Schema
const queryLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  department: {
    type: String,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  queryLength: {
    type: Number,
    required: true
  },
  complexity: {
    type: String,
    enum: ['simple', 'moderate', 'complex'],
    required: true,
    index: true
  },
  modelUsed: {
    type: String,
    required: true,
    index: true
  },
  modelProvider: {
    type: String,
    required: true
  },
  inputTokens: {
    type: Number,
    required: true
  },
  outputTokens: {
    type: Number,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  savingsVsGPT4: {
    type: Number,
    required: true
  },
  latency: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
});

// Cost Summary Schema (for daily aggregates)
const costSummarySchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalQueries: {
    type: Number,
    default: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  totalSavings: {
    type: Number,
    default: 0
  },
  modelBreakdown: {
    type: Map,
    of: {
      queries: Number,
      cost: Number
    },
    default: {}
  },
  departmentBreakdown: {
    type: Map,
    of: {
      queries: Number,
      cost: Number
    },
    default: {}
  }
});

// Create compound index for efficient lookups
costSummarySchema.index({ companyId: 1, date: 1 }, { unique: true });

const Company = mongoose.model('Company', companySchema);
const QueryLog = mongoose.model('QueryLog', queryLogSchema);
const CostSummary = mongoose.model('CostSummary', costSummarySchema);

module.exports = {
  Company,
  QueryLog,
  CostSummary
};
