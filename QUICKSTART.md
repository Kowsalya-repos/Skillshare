# 🚀 Quick Start Guide - SkillShare Platform

## Prerequisites Installation

### 1. Install Node.js
- Visit https://nodejs.org/
- Download and install the LTS version (v18 or higher recommended)
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB
**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Run the installer and follow the setup wizard
- MongoDB Compass (GUI) is included

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## 🎯 5-Minute Setup

### Step 1: Start MongoDB
```bash
# Verify MongoDB is running
mongosh
# If it connects, you're good! Type 'exit' to quit

# If not running, start it:
# Windows: MongoDB should auto-start, or use MongoDB Compass
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Step 2: Setup Backend
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file (use any text editor)
# Make sure MONGODB_URI=mongodb://localhost:27017/skillshare

# Start the server
npm run dev
```

You should see: "Server running on port 5000" and "MongoDB Connected"

### Step 3: Setup Frontend
Open a NEW terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

Your browser should automatically open to `http://localhost:3000`

## ✅ You're Ready!

### Create Your First Account

1. Click "Sign Up"
2. Choose user type:
   - **Skill Seeker**: Looking to learn skills
   - **Skill Provider**: Want to teach skills
3. Fill in your details (use real city/state for better matching)
4. Login and start exploring!

### Test the Platform

**As a Provider:**
1. Go to "My Skills"
2. Add a skill (e.g., "Python Programming", "Guitar Lessons")
3. Wait for requests in the "Requests" tab

**As a Seeker:**
1. Go to "Explore"
2. Browse providers (they're sorted by location proximity!)
3. Click on a provider and send a request
4. Once accepted, start chatting!

## 🎨 Key Features to Try

1. **Location-Based Sorting**: Providers in your city appear first
2. **Real-Time Notifications**: Watch the notification badge update
3. **Live Chat**: Send messages instantly when requests are accepted
4. **Session Booking**: Schedule learning sessions
5. **Ratings & Reviews**: Give feedback after sessions

## 🔧 Common Issues & Fixes

### "Cannot connect to MongoDB"
```bash
# Make sure MongoDB is running:
# macOS: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod
# Windows: Check MongoDB service in Services app
```

### "Port 5000 already in use"
Edit `backend/.env` and change:
```
PORT=5001
```
Then update frontend `src/App.jsx` line 4:
```javascript
const API_URL = 'http://localhost:5001/api';
```

### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
# Make sure you're in the frontend directory
cd frontend

# Try deleting node_modules
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📱 Using the App

### Navigation
- **Explore**: Find skill providers
- **Requests**: Manage incoming/outgoing requests
- **My Skills**: (Providers) Add and manage your skills
- **Sessions**: View scheduled and completed sessions
- **Chat**: Message other users

### Workflow
1. **Connect**: Seeker sends request to Provider
2. **Accept**: Provider accepts the request
3. **Chat**: Both can now communicate
4. **Schedule**: Book a session
5. **Learn**: Conduct the session
6. **Review**: Seeker rates the Provider

## 🎯 Next Steps

- Create multiple accounts to test different user types
- Try searching for skills in the Explore page
- Test the real-time chat functionality
- Book a session and give feedback
- Check how ratings update in real-time

## 💡 Pro Tips

- Use realistic location data for better sorting
- Add detailed skill descriptions as a provider
- Write clear messages when sending requests
- Give constructive feedback to build provider reputation
- Check the Requests tab regularly for notifications

## 🆘 Need Help?

If you encounter any issues:
1. Check that MongoDB is running
2. Verify both backend (port 5000) and frontend (port 3000) are running
3. Check browser console for errors (F12 → Console tab)
4. Check terminal output for server errors

---

**Enjoy building your skill-sharing community! 🎉**
