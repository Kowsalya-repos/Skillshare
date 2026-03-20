const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillshare';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['requester', 'provider'], required: true },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  skills: [{ 
    name: String, 
    description: String,
    category: String 
  }],
  portfolio: [{
    url: String,
    fileType: String,
    name: String
  }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  reviews: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Skill Request Schema
const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  message: String,
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'completed'], 
    default: 'pending' 
  },
  feedback: {
    rating: Number,
    comment: String,
    given: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

// Session Schema
const sessionSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: Date,
  duration: Number,
  meetLink: String,
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  feedback: {
    rating: Number,
    comment: String,
    given: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model('Session', sessionSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, userType, location } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      userType,
      location
    });

    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, userType: user.userType }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        userType: user.userType,
        location: user.location 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, userType: user.userType }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        userType: user.userType,
        location: user.location,
        skills: user.skills,
        rating: user.rating
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get providers (sorted by location proximity)
app.get('/api/providers', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const { search, skill } = req.query;
    
    let query = { userType: 'provider', _id: { $ne: req.user.userId } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (skill) {
      query['skills.name'] = { $regex: skill, $options: 'i' };
    }

    let providers = await User.find(query).select('-password');
    
    // Simple location-based sorting (same city/state prioritized)
    if (currentUser.location) {
      providers.sort((a, b) => {
        const aMatch = a.location?.city === currentUser.location?.city ? 2 : 
                       a.location?.state === currentUser.location?.state ? 1 : 0;
        const bMatch = b.location?.city === currentUser.location?.city ? 2 : 
                       b.location?.state === currentUser.location?.state ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add skills (for providers)
app.post('/api/skills', authenticateToken, async (req, res) => {
  try {
    const { skills } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (user.userType !== 'provider') {
      return res.status(403).json({ error: 'Only providers can add skills' });
    }

    user.skills = skills;
    await user.save();

    res.json({ message: 'Skills updated successfully', skills: user.skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create skill request
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { providerId, skill, message } = req.body;
    
    const request = new Request({
      requester: req.user.userId,
      provider: providerId,
      skill,
      message
    });

    await request.save();
    
    // Emit socket event for real-time notification
    io.to(providerId).emit('newRequest', request);

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get requests (for provider notifications)
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const query = req.user.userType === 'provider' 
      ? { provider: req.user.userId }
      : { requester: req.user.userId };

    const requests = await Request.find(query)
      .populate('requester', 'name email location')
      .populate('provider', 'name email skills rating')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
app.patch('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.provider.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    request.status = status;
    if (status === 'accepted') request.connectedAt = Date.now();
    await request.save();

    // Emit socket event
    io.to(request.requester.toString()).emit('requestUpdated', request);

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End connection
app.post('/api/requests/:id/end', authenticateToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    if (request.provider.toString() !== req.user.userId && request.requester.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    request.status = 'completed';
    request.endedAt = Date.now();
    await request.save();

    io.to(request.requester.toString()).emit('requestUpdated', request);
    io.to(request.provider.toString()).emit('requestUpdated', request);

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit request feedback
app.post('/api/requests/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.requester.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only requester can give feedback' });
    }

    request.feedback = { rating, comment, given: true };
    await request.save();

    const provider = await User.findById(request.provider);
    provider.totalRatings += 1;
    provider.rating = ((provider.rating * (provider.totalRatings - 1)) + rating) / provider.totalRatings;
    provider.reviews.push({
      from: req.user.userId,
      rating,
      comment
    });
    await provider.save();

    res.json({ message: 'Feedback submitted successfully', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages
app.get('/api/messages/:requestId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ request: req.params.requestId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { requestId, receiverId, message } = req.body;

    const newMessage = new Message({
      request: requestId,
      sender: req.user.userId,
      receiver: receiverId,
      message
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name');

    // Emit socket event
    io.to(receiverId).emit('newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create session
app.post('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const { requestId, scheduledDate, duration } = req.body;
    
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const sessionId = new mongoose.Types.ObjectId();
    const meetLink = `https://meet.jit.si/SkillShare-${sessionId.toString()}`;

    const session = new Session({
      _id: sessionId,
      request: requestId,
      requester: request.requester,
      provider: request.provider,
      scheduledDate,
      duration,
      meetLink
    });

    await session.save();

    // Emit live session update to requester
    io.to(request.requester.toString()).emit('sessionScheduled', session);

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sessions
app.get('/api/sessions', authenticateToken, async (req, res) => {
  try {
    const query = req.user.userType === 'provider'
      ? { provider: req.user.userId }
      : { requester: req.user.userId };

    const sessions = await Session.find(query)
      .populate('requester', 'name email')
      .populate('provider', 'name email skills')
      .sort({ scheduledDate: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Upload
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.userType !== 'provider') {
      return res.status(403).json({ error: 'Only providers can upload portfolio items' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let fileType = 'unknown';
    if (req.file.mimetype.includes('pdf')) fileType = 'pdf';
    else if (req.file.mimetype.includes('audio')) fileType = 'audio';
    else if (req.file.mimetype.includes('video')) fileType = 'video';
    else if (req.file.mimetype.includes('image')) fileType = 'image';

    const portfolioItem = {
      url: `/uploads/${req.file.filename}`,
      fileType: fileType,
      name: req.file.originalname
    };

    user.portfolio.push(portfolioItem);
    await user.save();

    res.json({ message: 'File uploaded successfully', item: portfolioItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Recommendations
app.get('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (currentUser.userType !== 'requester') {
      return res.status(403).json({ error: 'Only requesters get recommendations' });
    }

    // 1. Gather context of what the user looks for based on their previous requests
    const userRequests = await Request.find({ requester: currentUser._id });
    const requestedSkills = userRequests.map(r => r.skill.toLowerCase());

    // 2. Fetch all providers
    let providers = await User.find({ userType: 'provider' }).select('-password');

    // 3. Score each provider based on multiple factors
    const scoredProviders = providers.map(provider => {
      let score = 0;
      
      let matchedSkills = 0;
      provider.skills.forEach(s => {
        if (s.name && requestedSkills.includes(s.name.toLowerCase())) {
          matchedSkills++;
          score += 15;
        }
      });

      score += (provider.rating * 5);

      if (currentUser.location) {
        if (provider.location?.city === currentUser.location?.city) score += 20;
        else if (provider.location?.state === currentUser.location?.state) score += 10;
      }

      score += Math.random() * 5;

      return { provider, score, matchedSkills };
    });

    // 4. Sort by highest score
    scoredProviders.sort((a, b) => b.score - a.score);

    // Return the top 10 recommended providers
    res.json(scoredProviders.slice(0, 10).map(s => {
      return { ...s.provider.toObject(), recommendationScore: s.score, matchReason: s.matchedSkills > 0 ? 'Based on your past requests' : 'Highly rated nearby' };
    }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit feedback
app.post('/api/sessions/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.requester.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only requester can give feedback' });
    }

    session.feedback = { rating, comment, given: true };
    session.status = 'completed';
    await session.save();

    // Update provider rating
    const provider = await User.findById(session.provider);
    provider.totalRatings += 1;
    provider.rating = ((provider.rating * (provider.totalRatings - 1)) + rating) / provider.totalRatings;
    provider.reviews.push({
      from: req.user.userId,
      rating,
      comment
    });
    await provider.save();

    res.json({ message: 'Feedback submitted successfully', session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/profile/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('reviews.from', 'name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
