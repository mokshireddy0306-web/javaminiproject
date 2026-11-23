/**
 * ============================================================================
 * PROJECTHUB AI - BACKEND CONFIGURATION
 * ============================================================================
 */

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'projecthub-ai-super-secret-jwt-token-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 5432,
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
    NAME: process.env.DB_NAME || 'projecthub_db',
    USE_IN_MEMORY_FALLBACK: true
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
