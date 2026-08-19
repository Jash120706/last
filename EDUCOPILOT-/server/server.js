const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());

app.use(express.json({ limit: '20mb' }));

app.use(express.urlencoded({
  extended: true,
  limit: '20mb'
}));

// =====================================================
// DATABASE CONNECTION CHECK
// =====================================================

app.use((req, res, next) => {

  // Allow health checks even if MongoDB is unavailable
  if (
    req.path === '/' ||
    req.path === '/health' ||
    req.path === '/api/health'
  ) {
    return next();
  }

  // MongoDB readyState === 1 means connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database is currently unavailable. Please ensure MongoDB is running.'
    });
  }

  next();
});

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/professor', require('./routes/professor'));
app.use('/api/rag', require('./routes/rag'));
app.use('/api/support', require('./routes/support'));

// =====================================================
// ROOT ROUTE
// =====================================================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EduCopilot Backend API',
    message: 'Server is running successfully'
  });
});

// =====================================================
// BASIC HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EduCopilot Backend API'
  });
});

// =====================================================
// API HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {

  const dbStatus =
    mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected';

  res.json({
    status: 'ok',
    database: dbStatus,
    service: 'EduCopilot Backend API',

    llmProvider: process.env.GROQ_API_KEY
      ? 'Groq API'
      : 'Fallback Engine (Active)',

    model: process.env.GROQ_MODEL || 'groq/compound-mini',

    timestamp: new Date().toISOString()
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

  res.status(404).json({
    error: `API route not found: ${req.originalUrl}`
  });

});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

  console.error(
    '[Server Error]',
    err.stack || err
  );

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });

});

// =====================================================
// SERVER CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

const HOST = process.env.HOST || '0.0.0.0';

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {

  try {

    console.log('=========================================');
    console.log('Starting EduCopilot Backend...');
    console.log('=========================================');

    // Connect to MongoDB first
    await connectDB();

    console.log('MongoDB connection established.');

    // Listen on all network interfaces
    app.listen(PORT, HOST, () => {

      console.log('=========================================');
      console.log(
        `🚀 EduCopilot API Server running on ${HOST}:${PORT}`
      );
      console.log(
        `🔗 Root: http://localhost:${PORT}/`
      );
      console.log(
        `🔗 Health: http://localhost:${PORT}/health`
      );
      console.log(
        `🔗 API Health: http://localhost:${PORT}/api/health`
      );
      console.log('=========================================');

    });

  } catch (error) {

    console.error(
      '❌ Failed to start EduCopilot Backend:',
      error.message
    );

    process.exit(1);
  }
};

// Start application
startServer();
