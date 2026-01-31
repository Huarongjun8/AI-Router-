const QueryClassifier = require('./services/classifier');
const LLMRouter = require('./services/router');

console.log('🧪 Testing AI Router Components...\n');

// Test 1: Classifier
console.log('Test 1: Query Classifier');
console.log('========================');

const classifier = new QueryClassifier();

const testQueries = [
  'What is AI?',
  'Can you explain the differences between supervised and unsupervised learning in detail?',
  'Please provide a comprehensive analysis of the current state of quantum computing, including technical challenges and commercial applications'
];

testQueries.forEach((query, i) => {
  const complexity = classifier.classify(query);
  const selectedModel = classifier.selectModel(complexity);
  console.log(`\nQuery ${i + 1}: "${query.substring(0, 50)}..."`);
  console.log(`Complexity: ${complexity}`);
  console.log(`Selected Model: ${selectedModel.model} (${selectedModel.provider})`);
});

// Test 2: Model Listing
console.log('\n\nTest 2: Available Models');
console.log('========================');

const allModels = classifier.listModels();
console.log(`\nTotal models available: ${allModels.length}`);

console.log('\nBy Provider:');
const providers = ['openai', 'anthropic', 'google'];
providers.forEach(provider => {
  const models = classifier.listModels(provider);
  console.log(`\n${provider.toUpperCase()}:`);
  models.forEach(model => {
    console.log(`  - ${model.name} ($${model.inputCost}/$${model.outputCost} per 1M tokens)`);
  });
});

// Test 3: Cost Calculation
console.log('\n\nTest 3: Cost Calculation');
console.log('========================');

const router = new LLMRouter();

const sampleUsage = {
  inputTokens: 1000,
  outputTokens: 500,
  totalTokens: 1500
};

const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-haiku', 'claude-3-sonnet'];
console.log('\nSample query (1000 input tokens, 500 output tokens):');

models.forEach(model => {
  const cost = router.calculateCost(sampleUsage, model);
  const savings = router.calculateSavings(cost, sampleUsage);
  console.log(`\n${model}:`);
  console.log(`  Cost: $${cost.toFixed(6)}`);
  console.log(`  Savings vs GPT-4: $${savings.toFixed(6)}`);
  console.log(`  Savings %: ${((savings / (cost + savings)) * 100).toFixed(1)}%`);
});

console.log('\n\n✅ All tests completed!');
console.log('\n💡 Next step: Set up your .env file and run "node setup.js" to initialize the database');
