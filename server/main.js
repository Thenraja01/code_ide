const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth.route');
const fileRoutes = require('./src/routes/file.route');
const githubRoutes = require('./src/routes/github.route');
const authMiddleware = require('./middlewares/auth.middleware');

const app = express();

// Security and Performance Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // body parser with limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression()); // gzip compression
app.use(morgan('dev')); // logging

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per 15 minutes
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/github', authMiddleware, githubRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

module.exports = app;
