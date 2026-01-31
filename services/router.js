const axios = require('axios');

class LLMRouter {
  constructor() {
    // API endpoints for different providers
    this.endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages',
      google: 'https://generativelanguage.googleapis.com/v1beta/models'
    };

    // Pricing per 1M tokens
    this.pricing = {
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
      'claude-3-opus': { input: 15.00, output: 75.00 },
      'claude-3-sonnet': { input: 3.00, output: 15.00 },
      'claude-3-haiku': { input: 0.25, output: 1.25 },
      'gemini-pro': { input: 0.50, output: 1.50 },
      'gemini-ultra': { input: 10.00, output: 30.00 }
    };

    // GPT-4 baseline for savings calculation
    this.gpt4Pricing = { input: 30.00, output: 60.00 };
  }

  /**
   * Route query to the selected LLM provider
   */
  async routeQuery(query, selectedModel, systemPrompt = null) {
    const startTime = Date.now();
    const { provider, model } = selectedModel;

    try {
      let result;

      switch (provider) {
        case 'openai':
          result = await this.callOpenAI(query, model, systemPrompt);
          break;
        case 'anthropic':
          result = await this.callAnthropic(query, model, systemPrompt);
          break;
        case 'google':
          result = await this.callGoogle(query, model, systemPrompt);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const latency = Date.now() - startTime;

      return {
        response: result.response,
        usage: result.usage,
        latency
      };

    } catch (error) {
      console.error(`Error routing to ${provider}:`, error.message);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(query, model, systemPrompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: query });

    const response = await axios.post(
      this.endpoints.openai,
      {
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      response: response.data.choices[0].message.content,
      usage: {
        inputTokens: response.data.usage.prompt_tokens,
        outputTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      }
    };
  }

  /**
   * Call Anthropic API
   */
  async callAnthropic(query, model, systemPrompt) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Map model names to Anthropic's format
    const modelMap = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307'
    };

    const anthropicModel = modelMap[model] || model;

    const requestBody = {
      model: anthropicModel,
      max_tokens: 2000,
      messages: [
        { role: 'user', content: query }
      ]
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    const response = await axios.post(
      this.endpoints.anthropic,
      requestBody,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      response: response.data.content[0].text,
      usage: {
        inputTokens: response.data.usage.input_tokens,
        outputTokens: response.data.usage.output_tokens,
        totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
      }
    };
  }

  /**
   * Call Google Gemini API
   */
  async callGoogle(query, model, systemPrompt) {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google API key not configured');
    }

    const endpoint = `${this.endpoints.google}/${model}:generateContent?key=${apiKey}`;

    const content = systemPrompt 
      ? `${systemPrompt}\n\n${query}`
      : query;

    const response = await axios.post(
      endpoint,
      {
        contents: [
          {
            parts: [
              { text: content }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    
    // Google doesn't provide exact token counts in all cases
    // Estimate based on text length
    const inputTokens = Math.ceil(content.length / 4);
    const outputTokens = Math.ceil(text.length / 4);

    return {
      response: text,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    };
  }

  /**
   * Calculate cost for a query
   */
  calculateCost(usage, modelName) {
    const pricing = this.pricing[modelName];
    
    if (!pricing) {
      console.warn(`No pricing found for model: ${modelName}`);
      return 0;
    }

    const inputCost = (usage.inputTokens / 1000000) * pricing.input;
    const outputCost = (usage.outputTokens / 1000000) * pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Calculate savings compared to GPT-4
   */
  calculateSavings(actualCost, usage) {
    const gpt4InputCost = (usage.inputTokens / 1000000) * this.gpt4Pricing.input;
    const gpt4OutputCost = (usage.outputTokens / 1000000) * this.gpt4Pricing.output;
    const gpt4TotalCost = gpt4InputCost + gpt4OutputCost;

    return Math.max(0, gpt4TotalCost - actualCost);
  }

  /**
   * Estimate tokens from text
   */
  estimateTokens(text) {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

module.exports = LLMRouter;
