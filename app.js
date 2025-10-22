const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const sequelize = require('./config/database');
const setupSocketHandlers = require('./socket/socketHandlers');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store io instance in app
app.set('io', io);

// ✅ Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Polling App Backend is Running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      polls: {
        getAll: 'GET /api/polls',
        getById: 'GET /api/polls/:id',
        create: 'POST /api/polls',
        vote: 'POST /api/polls/:id/vote',
        results: 'GET /api/polls/:id/results'
      },
      health: 'GET /api/health'
    },
    database: {
      connected: true,
      dialect: 'MySQL'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Setup socket handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

// Track if server is already running
let serverStarted = false;

const startServer = async () => {
  if (serverStarted) return;
  
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      serverStarted = true;
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};


module.exports = (req, res) => {
  // Initialize database and start server on first request
  if (!serverStarted) {
    startServer().catch(console.error);
  }
  return app(req, res);
};

// ✅ For local development
if (require.main === module) {
  startServer();
}