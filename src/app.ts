import cors from 'cors';
import express from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import RoutesV1 from './routes/v1';
import { Morgan } from './utils/logger/morgen';
import cookieParser from 'cookie-parser';
import config from './config';
import { notFoundError } from './errors';
import serveResponse from './utils/server/serveResponse';

/**
 * The main application instance
 *
 * This is the main application instance that sets up the Express server.
 * It configures middleware, routes, and error handling.
 */
const app = express();

// Configure middleware
app.use(
  cors({
    origin: config.server.allowed_origins,
    credentials: true,
  }),

  Morgan.successHandler,
  Morgan.errorHandler,

  (req, res, next) =>
    (req.headers['stripe-signature']
      ? express.raw({ type: 'application/json' })
      : express.json())(req, res, next),

  express.text(),
  express.urlencoded({ extended: true }),
  cookieParser(),
);

// Serve static files
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(/^\/api\/v\d+/, express.static('public'));
app.use(/^\/api\/v\d+/, express.static('uploads'));

app.get('/', (_, res) => {
  res.redirect('/health');
});

// Health check
app.get('/health', (_, res) => {
  serveResponse(res, {
    message: 'Server is healthy!',
    meta: {
      timestamp: new Date(),
      version: process.env.npm_package_version,
      env: process.env.NODE_ENV,
    },
  });
});

// API routes
app.use('/api/v1', RoutesV1);

// 404 handler
app.use(({ originalUrl }, _, next) => {
  next(notFoundError(originalUrl));
});

// Error handler
app.use(globalErrorHandler);

export default app;
