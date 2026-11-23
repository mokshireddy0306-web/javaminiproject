/**
 * ============================================================================
 * PROJECTHUB AI - BACKEND REST API SERVER
 * Express Server with Modular Routing, Security, CORS, and In-Memory Storage
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const requestRoutes = require('./routes/requestRoutes');
const queryRoutes = require('./routes/queryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Frontend static assets if accessed directly
app.use(express.static(path.join(__dirname, '../frontend')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'ProjectHub AI Platform API',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    activeCohorts: ['CSE-3-A', 'CSE-3-B', 'AIML-3-A']
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/admin', adminRoutes);

// Fallback Route for Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`
  ==============================================================
  🚀 PROJECTHUB AI - SERVER RUNNING
  ==============================================================
  📡 API Port:        http://localhost:${config.PORT}
  💻 Health Endpoint: http://localhost:${config.PORT}/api/health
  🌐 Web Application: http://localhost:${config.PORT}
  ==============================================================
    `);
  });
}

module.exports = app;
