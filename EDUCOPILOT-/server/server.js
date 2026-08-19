const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();

// =====================================================
// CREATE EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());

app.use(express.json({
  limit: '20mb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '20mb'
}));

// =====================================================
// DATABASE CONNECTION CHECK
// =====================================================

app.use((req, res, next) => {

  // Always allow health checks
  if (
    req.path === '/health' ||
    req.path === '/api/health'
  ) {
    return next();
  }

  // Allow frontend static files
  if (
    req.path.startsWith('/assets') ||
    req.path === '/' ||
    !req.path.startsWith('/api')
  ) {
    return next();
  }

  // Check MongoDB for API requests
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database is currently unavailable.'
    });
  }

  next();
});

// =====================================================
// API ROUTES
// =====================================================

app.use(
  '/api/auth',
  require('./routes/auth')
);

app.use(
  '/api/student',
  require('./routes/student')
);

app.use(
  '/api/professor',
  require('./routes/professor')
);

app.use(
  '/api/rag',
  require('./routes/rag')
);

app.use(
  '/api/support',
  require('./routes/support')
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {

  res.status(200).json({
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

  res.status(200).json({

    status: 'ok',

    database: dbStatus,

    service: 'EduCopilot Backend API',

    llmProvider:
      process.env.GROQ_API_KEY
        ? 'Groq API'
        : 'Fallback Engine (Active)',

    model:
      process.env.GROQ_MODEL ||
      'groq/compound-mini',

    timestamp:
      new Date().toISOString()

  });

});

// =====================================================
// REACT FRONTEND
// =====================================================

// server/server.js
//        ↓
// ../client/dist

const clientPath = path.join(
  __dirname,
  '..',
  'client',
  'dist'
);

console.log(
  'React client path:',
  clientPath
);

// =====================================================
// SERVE REACT STATIC FILES
// =====================================================

app.use(
  express.static(clientPath)
);

// =====================================================
// REACT SPA FALLBACK
// =====================================================

// Handle React routes such as:
//
// /login
// /register
// /student
// /professor
// /dashboard
//
// But don't interfere with /api routes.

app.use((req, res, next) => {

  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(
    path.join(
      clientPath,
      'index.html'
    ),
    (error) => {

      if (error) {
        next(error);
      }

    }
  );

});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

  res.status(404).json({
    error:
      `API route not found: ${req.originalUrl}`
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

  res.status(
    err.status || 500
  ).json({

    error:
      err.message ||
      'Internal Server Error'

  });

});

// =====================================================
// SERVER CONFIGURATION
// =====================================================

const PORT =
  process.env.PORT || 5000;

const HOST =
  process.env.HOST || '0.0.0.0';

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {

  try {

    console.log('');
    console.log('=========================================');
    console.log('      STARTING EDUCOPILOT SERVER');
    console.log('=========================================');

    // ---------------------------------------------
    // CONNECT MONGODB
    // ---------------------------------------------

    await connectDB();

    console.log(
      '✅ MongoDB connection established.'
    );

    // ---------------------------------------------
    // START EXPRESS
    // ---------------------------------------------

    app.listen(
      PORT,
      HOST,
      () => {

        console.log('');
        console.log('=========================================');

        console.log(
          `🚀 EduCopilot Server running on ${HOST}:${PORT}`
        );

        console.log(
          `🌐 Application: http://localhost:${PORT}/`
        );

        console.log(
          `❤️ Health: http://localhost:${PORT}/health`
        );

        console.log(
          `🔗 API Health: http://localhost:${PORT}/api/health`
        );

        console.log('=========================================');
        console.log('');

      }
    );

  } catch (error) {

    console.error('');
    console.error(
      '❌ Failed to start EduCopilot server:'
    );

    console.error(
      error.message
    );

    process.exit(1);

  }

};

// =====================================================
// START APPLICATION
// =====================================================

startServer();
