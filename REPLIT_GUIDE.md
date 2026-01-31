# 🚀 REPLIT DEPLOYMENT GUIDE - STEP BY STEP

## Complete Setup in 15 Minutes

### STEP 1: Upload to Replit (2 minutes)

1. Go to **replit.com** and sign up/login
2. Click **"Create Repl"**
3. Choose **"Import from Upload"**
4. Upload ALL these files in a ZIP:
   - server.js
   - models.js
   - package.json
   - setup.js
   - test.js
   - .gitignore
   - .env.example
   - README.md
   - services/classifier.js
   - services/router.js

**OR** manually create files one by one in Replit and copy/paste the contents.

---

### STEP 2: Get MongoDB (5 minutes) - FREE

1. Go to **mongodb.com/cloud/atlas**
2. Click **"Try Free"**
3. Create account
4. Choose **FREE M0 cluster**
5. Choose AWS provider (any region)
6. Create cluster
7. Click **"Connect"** → **"Connect your application"**
8. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
9. Replace `<password>` with your actual password
10. Important: Go to **"Network Access"** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`)

---

### STEP 3: Get API Keys (3 minutes) - Pick ONE at minimum

**Option A: OpenAI (Most Popular)**
1. Go to **platform.openai.com/api-keys**
2. Sign up / Login
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)
5. Add $5-10 credit to your account

**Option B: Anthropic (Best Quality/Price)**
1. Go to **console.anthropic.com**
2. Sign up / Login
3. Get API key from settings
4. Key starts with `sk-ant-`
5. Add credit if needed

**Option C: Google Gemini (Free Tier Available)**
1. Go to **makersuite.google.com/app/apikey**
2. Create API key
3. Free tier: 60 requests/minute

---

### STEP 4: Configure Replit Secrets (3 minutes)

In Replit, click the **🔒 Lock icon** (Secrets) in left sidebar.

Add these secrets one by one:

```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/ai-router

Key: JWT_SECRET
Value: any-random-string-make-it-long-and-complex-123456

Key: PORT
Value: 3000

Key: OPENAI_API_KEY
Value: sk-your-openai-key-here

Key: ANTHROPIC_API_KEY
Value: sk-ant-your-anthropic-key-here

Key: GOOGLE_API_KEY
Value: your-google-key-here (optional)
```

**You need at least ONE provider API key (OpenAI OR Anthropic OR Google)**

---

### STEP 5: Install & Initialize (2 minutes)

In Replit **Shell** tab (bottom), run these commands:

```bash
# Install dependencies
npm install

# Run test to verify everything works
node test.js

# Set up database with demo company
node setup.js
```

The `setup.js` will create a demo company and give you an **API KEY** - COPY THIS!

It looks like: `sk-abc123def456...`

---

### STEP 6: Start Your Server (1 minute)

Click the big green **▶ Run** button at the top, or run:

```bash
npm start
```

You should see:
```
Connected to MongoDB
AI Router API running on port 3000
```

Your API is now LIVE at: `https://your-repl-name.your-username.repl.co`

---

### STEP 7: Test Your API (2 minutes)

**Option A: Use Replit Shell**

```bash
curl -X POST https://your-repl-name.your-username.repl.co/api/query \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_FROM_SETUP" \
  -d '{"query": "What is artificial intelligence?"}'
```

**Option B: Use Browser**

Go to: `https://your-repl-name.your-username.repl.co/health`

You should see: `{"status":"ok","timestamp":"..."}`

**Option C: Use Postman/Insomnia**

- URL: `https://your-repl-name.your-username.repl.co/api/query`
- Method: POST
- Headers: 
  - `Content-Type: application/json`
  - `x-api-key: YOUR_API_KEY`
- Body:
```json
{
  "query": "Explain machine learning",
  "userId": "test@example.com",
  "department": "engineering"
}
```

---

### ✅ SUCCESS! Your API is Live!

You should get a response like:

```json
{
  "response": "Machine learning is a subset of artificial intelligence...",
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

---

## 🎯 Next Steps - Start Selling!

### 1. Get Your Public URL
Your Repl URL: `https://your-repl-name.your-username.repl.co`

### 2. Keep It Running 24/7
- Upgrade to Replit **Hacker Plan** ($7/mo)
- Enable **"Always On"** in Repl settings
- Or use **UptimeRobot.com** (free) to ping your URL every 5 minutes

### 3. Create More Companies
Run `setup.js` with different company names, or manually create in MongoDB.

### 4. Share with First Customer
Give them:
- Your API URL
- Their unique API key
- Integration docs from README.md

---

## 💰 Pricing Your Service

Suggested pricing models:

**Option 1: Percentage of Savings**
- Free up to 1,000 queries
- Then charge 10-20% of money saved vs GPT-4

**Option 2: Flat Monthly Fee**
- Starter: $49/mo (up to 10K queries)
- Pro: $199/mo (up to 100K queries)
- Enterprise: Custom pricing

**Option 3: Hybrid**
- $99/mo base + 5% of savings

---

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Check MONGODB_URI in Secrets
- Verify Network Access allows 0.0.0.0/0
- Check username/password in connection string

**"OpenAI API key not configured"**
- Make sure key is in Secrets (not .env file)
- Key name must be exactly `OPENAI_API_KEY`
- Check you have credits in OpenAI account

**"Module not found"**
- Run `npm install` again
- Make sure package.json is uploaded

**Repl goes to sleep**
- Upgrade to Hacker plan ($7/mo)
- Enable "Always On"
- Or use free UptimeRobot pinger

---

## 📞 Ready to Sell?

Your pitch:
> "We automatically route your AI queries to the cheapest suitable model, saving you 50-70% on AI costs while maintaining quality. Just replace your OpenAI API endpoint with ours."

Target customers:
- Companies spending $500+/month on OpenAI
- SaaS companies with AI features
- Customer support teams using AI
- Consulting firms

Your edge:
- Immediate ROI (they save money from day 1)
- No code changes needed (just API swap)
- Track savings in real-time

---

🎉 **You're live and ready to get your first customer!**
