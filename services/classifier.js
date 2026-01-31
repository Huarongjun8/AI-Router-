class QueryClassifier {
  constructor() {
    // Keywords that indicate different complexity levels
    this.complexKeywords = [
      'analyze', 'compare', 'explain', 'detailed', 'comprehensive',
      'evaluate', 'assess', 'critique', 'elaborate', 'discuss',
      'research', 'investigate', 'summarize', 'review'
    ];

    this.technicalKeywords = [
      'algorithm', 'architecture', 'implement', 'optimize', 'debug',
      'refactor', 'design', 'engineer', 'develop', 'code'
    ];

    // Model configurations with pricing (per 1M tokens)
    this.models = {
      // OpenAI
      'gpt-4-turbo': {
        provider: 'openai',
        inputCost: 10.00,
        outputCost: 30.00,
        complexity: ['complex'],
        speed: 'medium'
      },
      'gpt-4': {
        provider: 'openai',
        inputCost: 30.00,
        outputCost: 60.00,
        complexity: ['complex'],
        speed: 'slow'
      },
      'gpt-3.5-turbo': {
        provider: 'openai',
        inputCost: 0.50,
        outputCost: 1.50,
        complexity: ['simple', 'moderate'],
        speed: 'fast'
      },

      // Anthropic
      'claude-3-opus': {
        provider: 'anthropic',
        inputCost: 15.00,
        outputCost: 75.00,
        complexity: ['complex'],
        speed: 'medium'
      },
      'claude-3-sonnet': {
        provider: 'anthropic',
        inputCost: 3.00,
        outputCost: 15.00,
        complexity: ['moderate', 'complex'],
        speed: 'fast'
      },
      'claude-3-haiku': {
        provider: 'anthropic',
        inputCost: 0.25,
        outputCost: 1.25,
        complexity: ['simple', 'moderate'],
        speed: 'very-fast'
      },

      // Google
      'gemini-pro': {
        provider: 'google',
        inputCost: 0.50,
        outputCost: 1.50,
        complexity: ['simple', 'moderate'],
        speed: 'fast'
      },
      'gemini-ultra': {
        provider: 'google',
        inputCost: 10.00,
        outputCost: 30.00,
        complexity: ['complex'],
        speed: 'medium'
      }
    };
  }

  /**
   * Classify query complexity based on content analysis
   */
  classify(query) {
    const lowerQuery = query.toLowerCase();
    const length = query.length;
    const wordCount = query.split(/\s+/).length;

    // Check for complex keywords
    const hasComplexKeywords = this.complexKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );

    const hasTechnicalKeywords = this.technicalKeywords.some(keyword =>
      lowerQuery.includes(keyword)
    );

    // Check for multiple questions
    const questionCount = (query.match(/\?/g) || []).length;
    const hasMultipleQuestions = questionCount > 1;

    // Check for code blocks or technical content
    const hasCodeBlock = /```|`[^`]+`/.test(query);
    
    // Complexity scoring
    let complexityScore = 0;

    // Length factors
    if (length > 500) complexityScore += 3;
    else if (length > 200) complexityScore += 2;
    else if (length > 100) complexityScore += 1;

    // Word count factors
    if (wordCount > 100) complexityScore += 2;
    else if (wordCount > 50) complexityScore += 1;

    // Content factors
    if (hasComplexKeywords) complexityScore += 2;
    if (hasTechnicalKeywords) complexityScore += 1;
    if (hasMultipleQuestions) complexityScore += 1;
    if (hasCodeBlock) complexityScore += 2;

    // Determine final complexity
    if (complexityScore >= 5) return 'complex';
    if (complexityScore >= 2) return 'moderate';
    return 'simple';
  }

  /**
   * Select the optimal model based on complexity and preferences
   */
  selectModel(complexity, preferences = {}) {
    const {
      preferredProviders = ['openai', 'anthropic', 'google'],
      prioritizeSpeed = false,
      prioritizeCost = true,
      maxCostPerQuery = 0.1
    } = preferences;

    // Filter models by complexity
    const suitableModels = Object.entries(this.models)
      .filter(([name, config]) => config.complexity.includes(complexity))
      .filter(([name, config]) => preferredProviders.includes(config.provider));

    if (suitableModels.length === 0) {
      // Fallback to any model that matches complexity
      const fallbackModels = Object.entries(this.models)
        .filter(([name, config]) => config.complexity.includes(complexity));
      
      if (fallbackModels.length === 0) {
        // Ultimate fallback
        return {
          model: 'gpt-3.5-turbo',
          provider: 'openai',
          config: this.models['gpt-3.5-turbo']
        };
      }
      
      return {
        model: fallbackModels[0][0],
        provider: fallbackModels[0][1].provider,
        config: fallbackModels[0][1]
      };
    }

    // Sort by priority
    let sortedModels;
    if (prioritizeCost) {
      // Sort by average cost (input + output)
      sortedModels = suitableModels.sort((a, b) => {
        const avgCostA = (a[1].inputCost + a[1].outputCost) / 2;
        const avgCostB = (b[1].inputCost + b[1].outputCost) / 2;
        return avgCostA - avgCostB;
      });
    } else if (prioritizeSpeed) {
      // Sort by speed
      const speedOrder = { 'very-fast': 1, 'fast': 2, 'medium': 3, 'slow': 4 };
      sortedModels = suitableModels.sort((a, b) => 
        speedOrder[a[1].speed] - speedOrder[b[1].speed]
      );
    } else {
      // Balance cost and speed
      sortedModels = suitableModels.sort((a, b) => {
        const scoreA = (a[1].inputCost + a[1].outputCost) / 2;
        const scoreB = (b[1].inputCost + b[1].outputCost) / 2;
        return scoreA - scoreB;
      });
    }

    const selectedModel = sortedModels[0];

    return {
      model: selectedModel[0],
      provider: selectedModel[1].provider,
      config: selectedModel[1]
    };
  }

  /**
   * Get model configuration
   */
  getModelConfig(modelName) {
    return this.models[modelName] || null;
  }

  /**
   * List all available models
   */
  listModels(provider = null) {
    if (provider) {
      return Object.entries(this.models)
        .filter(([name, config]) => config.provider === provider)
        .map(([name, config]) => ({ name, ...config }));
    }
    return Object.entries(this.models)
      .map(([name, config]) => ({ name, ...config }));
  }
}

module.exports = QueryClassifier;
