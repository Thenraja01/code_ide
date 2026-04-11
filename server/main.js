const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth.route');
const fileRoutes = require('./src/routes/file.route');
const githubRoutes = require('./src/routes/github.route');
const projectRoutes = require('./src/routes/project.route');
const statsRoutes = require('./src/routes/stats.route');
const userRoutes = require('./src/routes/user.route');
const executionRoutes = require('./src/routes/execution.route');
const authMiddleware = require('./src/middlewares/auth.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression()); 
app.use(morgan('dev')); 

// Rate limiting
const limiter = rateLimit({
  max: 100, 
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/files', authMiddleware, fileRoutes);
app.use('/api/github', authMiddleware, githubRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/execute', authMiddleware, executionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    status: 'error', 
    message: err.message || 'Internal Server Error' 
  });
});

module.exports = app;

