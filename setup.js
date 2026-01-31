const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const { Company } = require('./models');

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Generate API key
    const apiKey = `sk-${crypto.randomBytes(32).toString('hex')}`;

    // Create demo company
    const demoCompany = new Company({
      name: 'Demo Company',
      email: 'demo@example.com',
      apiKey: apiKey,
      preferences: {
        preferredProviders: ['openai', 'anthropic'],
        maxCostPerQuery: 0.10,
        prioritizeSpeed: false,
        prioritizeCost: true
      },
      subscription: {
        plan: 'professional',
        queryLimit: 50000,
        isActive: true
      }
    });

    await demoCompany.save();

    console.log('\n✅ Database setup complete!');
    console.log('\n📋 Demo Company Details:');
    console.log('   Name:', demoCompany.name);
    console.log('   Email:', demoCompany.email);
    console.log('   API Key:', apiKey);
    console.log('\n💡 Use this API Key in the x-api-key header to test your queries');
    console.log('\nExample curl command:');
    console.log(`curl -X POST http://localhost:3000/api/query \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{"query": "What is artificial intelligence?"}'`);

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('❌ Demo company already exists. Delete it first or use existing API key.');
    } else {
      console.error('❌ Setup failed:', error.message);
    }
    process.exit(1);
  }
}

setupDatabase();
