# AI Query Router - Production Ready

An intelligent AI query routing system that automatically selects the most cost-effective LLM model based on query complexity, saving up to 70% on AI costs while maintaining quality.

## 🚀 Features

- **Intelligent Query Classification**: Automatically analyzes query complexity
- **Multi-Provider Support**: OpenAI, Anthropic, Google Gemini
- **Cost Optimization**: Routes to cheapest suitable model
- **Real-time Analytics**: Track usage, costs, and savings
- **RESTful API**: Easy integration with any application
- **Enterprise Ready**: Rate limiting, authentication, logging

## 📦 What's Included

```
ai-router/
├── server.js           # Main Express server
├── models.js           # MongoDB schemas
├── services/
│   ├── classifier.js   # Query complexity classifier
│   └── router.js       # LLM routing logic
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── setup.js           # Database initialization script
└── README.md          # This file
```

## 🔧 Quick Start on Replit

### Step 1: Create New Repl

1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub" or "Upload files"

### Step 2: Upload Files

Upload ALL these files to your Repl:
- `server.js`
- `models.js`
- `package.json`
- `setup.js`
- `.env.example`
- `services/classifier.js`
- `services/router.js`

### Step 3: Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - Free)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)
4. Whitelist all IPs: `0.0.0.0/0` (in Network Access)

**Option B: Replit Database**

Replit has built-in database, but MongoDB is better for this project.

### Step 4: Get API Keys

Get at least one API key from:

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Step 5: Configure Environment Variables

In Replit:
1. Click "Secrets" (lock icon) in left sidebar
2. Add these secrets:

```
MONGODB_URI = your-mongodb-connection-string
JWT_SECRET = any-random-long-string-here
OPENAI_API_KEY = sk-your-openai-key
ANTHROPIC_API_KEY = sk-ant-your-anthropic-key
GOOGLE_API_KEY = your-google-key (optional)
PORT = 3000
```

### Step 6: Install & Run

In Replit Shell:

```bash
# Install dependencies
npm install

# Set up database with demo company
node setup.js

# Start server
npm start
```

Your API will be live at: `https://your-repl-name.your-username.repl.co`

## 📡 API Endpoints

### 1. Submit Query (Main Endpoint)

```bash
POST /api/query
Headers: x-api-key: YOUR_API_KEY
Body: {
  "query": "What is machine learning?",
  "userId": "user@company.com",
  "department": "engineering"
}
```

**Response:**
```json
{
  "response": "Machine learning is...",
  "metadata": {
    "model": "claude-3-haiku",
    "provider": "anthropic",
    "complexity": "simple",
    "cost": "0.000125",
    "savings": "0.002875",
    "latency": 847,
    "tokens": {
      "input": 24,
      "output": 156,
      "total": 180
    }
  }
}
```

### 2. Health Check

```bash
GET /health
```

### 3. Analytics Dashboard

```bash
GET /api/analytics?startDate=2024-01-01&endDate=2024-01-31
Headers: Authorization: Bearer JWT_TOKEN
```

### 4. Recent Queries

```bash
GET /api/queries/recent?limit=50
Headers: Authorization: Bearer JWT_TOKEN
```

## 💰 Pricing Models

The system automatically selects from these models:

| Model | Provider | Input $/1M | Output $/1M | Best For |
|-------|----------|-----------|-------------|----------|
| claude-3-haiku | Anthropic | $0.25 | $1.25 | Simple queries |
| gpt-3.5-turbo | OpenAI | $0.50 | $1.50 | Simple queries |
| claude-3-sonnet | Anthropic | $3.00 | $15.00 | Moderate queries |
| gpt-4-turbo | OpenAI | $10.00 | $30.00 | Complex queries |
| claude-3-opus | Anthropic | $15.00 | $75.00 | Complex queries |

## 🎯 How It Works

1. **Query Analysis**: System analyzes query length, keywords, complexity
2. **Model Selection**: Chooses cheapest model that can handle the complexity
3. **API Routing**: Routes to selected provider (OpenAI/Anthropic/Google)
4. **Cost Tracking**: Logs cost and calculates savings vs GPT-4
5. **Response**: Returns answer with metadata

## 🔐 Security Features

- API Key authentication
- JWT tokens for admin access
- Rate limiting (100 requests/15min)
- Helmet.js security headers
- CORS protection

## 📊 Cost Savings Example

Typical usage for a company with 10,000 queries/month:

| Scenario | Model Used | Monthly Cost |
|----------|-----------|--------------|
| All GPT-4 | gpt-4 | $450 |
| Smart Routing | Mixed | $135 |
| **Savings** | | **$315/month (70%)** |

## 🛠️ Customization

### Change Model Preferences

Edit company preferences in database:

```javascript
{
  preferences: {
    preferredProviders: ['anthropic', 'openai'],
    maxCostPerQuery: 0.10,
    prioritizeSpeed: false,  // Set true for faster models
    prioritizeCost: true     // Set true for cheaper models
  }
}
```

### Add New Models

Edit `services/classifier.js` to add new models and pricing.

## 📱 Client Integration

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function askAI(question) {
  const response = await axios.post(
    'https://your-repl.repl.co/api/query',
    { query: question },
    { headers: { 'x-api-key': 'your-api-key' } }
  );
  
  console.log('Answer:', response.data.response);
  console.log('Cost:', response.data.metadata.cost);
  console.log('Saved:', response.data.metadata.savings);
}
```

### Python

```python
import requests

def ask_ai(question):
    response = requests.post(
        'https://your-repl.repl.co/api/query',
        json={'query': question},
        headers={'x-api-key': 'your-api-key'}
    )
    data = response.json()
    print(f"Answer: {data['response']}")
    print(f"Cost: ${data['metadata']['cost']}")
    print(f"Saved: ${data['metadata']['savings']}")
```

### cURL

```bash
curl -X POST https://your-repl.repl.co/api/query \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"query": "Explain quantum computing"}'
```

## 🐛 Troubleshooting

### "MongoDB connection error"
- Check your MONGODB_URI in Secrets
- Make sure IP whitelist includes `0.0.0.0/0`
- Verify username/password in connection string

### "API key not configured"
- Add provider API keys to Replit Secrets
- Keys should be named exactly: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

### "Port already in use"
- Change PORT in Secrets to different number (e.g., 3001)

## 📈 Scaling to Production

### On Replit (Simple)

1. Upgrade to Replit Hacker plan ($7/mo)
2. Enable "Always On" to prevent sleeping
3. Add custom domain in Replit settings

### On Cloud (Advanced)

Deploy to:
- **Vercel**: Best for serverless
- **Railway**: Easy full-stack deployment  
- **AWS/GCP/Azure**: Enterprise scale

## 💡 Next Steps

1. **Add Frontend**: Create dashboard to visualize savings
2. **Add Webhooks**: Real-time notifications for high-cost queries
3. **Add Caching**: Cache common queries to save even more
4. **Add A/B Testing**: Compare model quality vs cost
5. **Add User Management**: Team accounts and permissions

## 📞 Support

Questions? Issues? 
- Check Replit logs for errors
- Review MongoDB Atlas logs
- Test with simple query first

## 🎉 You're Ready!

Your AI Router is now live and saving money on every query. Start integrating it into your apps and watch the savings add up!

---

**Pro Tip**: Monitor your first week of usage carefully to fine-tune the complexity classifier for your specific use case.
