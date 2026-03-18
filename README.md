# SkillShare Platform - MERN Stack

A full-featured community skill-sharing platform built with MongoDB, Express, React, and Node.js.

## ✨ Features

### For Skill Seekers (Requesters)
- 🔍 Discover skill providers sorted by location proximity
- 📋 Send skill learning requests to providers
- 💬 Real-time chat with accepted providers
- 📅 Book and manage learning sessions
- ⭐ Rate and review providers after sessions
- 🔔 Real-time notifications for request updates

### For Skill Providers
- ⚡ Manage your skill portfolio
- 📬 Receive and manage incoming requests
- ✅ Accept/decline learning requests
- 💬 Chat with requesters
- 📅 Schedule and conduct sessions
- ⭐ Build your reputation with ratings and reviews

### Core Features
- 🔐 Secure authentication with JWT
- 🌍 Location-based provider sorting
- 🔔 Real-time notifications with Socket.io
- 💬 Real-time chat messaging
- 📅 Session booking and management
- ⭐ Rating and review system
- 📱 Responsive, modern UI/UX

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Socket.io-client** - Real-time communication
- **Custom CSS** - Styling with modern design principles

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/skillshare
JWT_SECRET=your-secure-secret-key
PORT=5000
```

5. Start MongoDB (if not already running):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# Or run directly
mongod
```

6. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## 🚀 Usage

### First Time Setup

1. **Start MongoDB** - Ensure MongoDB is running on your machine

2. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

4. **Access the Application**:
   - Open `http://localhost:3000` in your browser
   - Create an account as either a Skill Seeker or Skill Provider
   - Start exploring!

### User Workflows

#### As a Skill Seeker:
1. Sign up and select "Skill Seeker" as user type
2. Enter your location details
3. Browse providers sorted by proximity
4. Click on a provider to view their profile and skills
5. Send a request specifying the skill you want to learn
6. Wait for provider to accept
7. Once accepted, chat with the provider
8. Book a session
9. After the session, provide feedback and rating

#### As a Skill Provider:
1. Sign up and select "Skill Provider" as user type
2. Enter your location details
3. Navigate to "My Skills" and add your skills
4. Check "Requests" tab for incoming requests
5. Accept or decline requests
6. Chat with requesters who you've accepted
7. Schedule sessions
8. Conduct sessions and receive feedback

## 📁 Project Structure

```
skillshare-platform/
├── backend/
│   ├── server.js          # Main server file with all routes
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
│
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   └── package.json       # Frontend dependencies
│
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Users
- `GET /api/providers` - Get all providers (sorted by location)
- `GET /api/profile/:id` - Get user profile

### Skills
- `POST /api/skills` - Add/update skills (providers only)

### Requests
- `POST /api/requests` - Create skill request
- `GET /api/requests` - Get user's requests
- `PATCH /api/requests/:id` - Update request status

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:requestId` - Get messages for a request

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - Get user's sessions
- `POST /api/sessions/:id/feedback` - Submit session feedback

## 🎨 Design Features

The UI features a modern, distinctive design with:
- **Syne** - Bold display font for headers
- **DM Sans** - Clean, readable body font
- Vibrant gradient color scheme (coral to teal)
- Smooth animations and transitions
- Card-based layouts with depth
- Real-time updates and notifications
- Responsive design for all devices

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Token-based API access control
- Protected routes and endpoints
- Input validation and sanitization

## 🚧 Future Enhancements

- Video call integration for sessions
- Payment processing for paid skills
- Advanced search and filtering
- Skill categories and tags
- User verification system
- Calendar integration
- Mobile app (React Native)
- Email notifications
- Social media integration
- Analytics dashboard

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongo

# Start MongoDB
mongod --dbpath /path/to/your/data/directory
```

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port in .env
PORT=5001
```

### CORS Issues
- Ensure backend CORS is configured to accept requests from `http://localhost:3000`
- Check that API_URL in frontend matches your backend URL

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Developer

Built with ❤️ using the MERN stack

---

**Happy Skill Sharing! 🎉**
