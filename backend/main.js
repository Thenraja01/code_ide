import express from 'express';
import * as Sentry from '@sentry/node';


import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import passport from 'passport';

import aiRoutes from './src/Router/ai.route.js';
import authRoutes from './src/Router/auth.route.js';
import projectRoutes from './src/Router/project.route.js';
import fileRoutes from './src/Router/file.route.js';
import githubRoutes from './src/Router/github.route.js';
import userRoutes from './src/Router/user.route.js';
import statsRoutes from './src/Router/stats.route.js';
import authMiddleware from './src/middlewares/auth.middleware.js';

import { serve } from "inngest/express";
import { inngest } from "./src/inngest/client.js";
import { functions } from "./src/inngest/index.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression()); 
app.use(morgan('dev')); 
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
  max: 100, 
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/inngest', serve({ client: inngest, functions }));

// Sentry Error Handler
Sentry.setupExpressErrorHandler(app);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    status: 'error', 
    message: err.message || 'Internal Server Error' 
  });
});

export default app;
