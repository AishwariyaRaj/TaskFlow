require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

if (process.env.STRIPE_SECRET && process.env.STRIPE_SECRET.startsWith('sk_live_')) {
  throw new Error('Live Stripe keys are not allowed. Use Stripe Test Mode keys only.');
}

// Security
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// For Stripe webhooks we need raw body
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api/webhooks/stripe')) return next();
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));
const rawBodyMiddleware = require('express').raw({ type: 'application/json' });
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { message: 'Too many requests, please try again later' } });
app.use('/api', limiter);

// Auth routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log(`[TEST] GET /api/test received`);
  res.json({ message: 'Backend is working!' });
});
app.post('/api/test-post', (req, res) => {
  console.log(`[TEST] POST /api/test-post received`);
  res.json({ message: 'POST working!' });
});

// Public invite accept (no workspace scoping needed)
const inviteCtrl = require('./controllers/inviteController');
const { requireAuth } = require('./middlewares/auth');
app.get('/api/invites/:token', inviteCtrl.getInvite);
app.post('/api/invites/:token/accept', inviteCtrl.acceptInvitePublic);

// Workspace-scoped routes
app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/workspaces/:workspaceId/projects', require('./routes/projects'));
app.use('/api/workspaces/:workspaceId', require('./routes/tasks'));
app.use('/api/workspaces/:workspaceId/billing', require('./routes/billing'));
app.use('/api/workspaces/:workspaceId/notifications', require('./routes/notifications'));
app.use('/api/workspaces/:workspaceId/uploads', require('./routes/uploads'));
app.use('/api/workspaces/:workspaceId/analytics', require('./routes/analytics'));
app.use('/api/workspaces/:workspaceId/invites', require('./routes/invites'));
app.use('/api/workspaces/:workspaceId/members', require('./routes/members'));
app.use('/api/workspaces/:workspaceId/comments', require('./routes/comments'));
app.use('/api/workspaces/:workspaceId/automations', require('./routes/automations'));

// Stripe webhook endpoint (raw body)
app.post('/api/webhooks/stripe', rawBodyMiddleware, async (req, res) => {
  if (!process.env.STRIPE_SECRET) return res.status(500).json({ message: 'Stripe is not configured. Set STRIPE_SECRET.' });
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).json({ message: 'Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET.' });
  if (process.env.STRIPE_SECRET.startsWith('sk_live_')) return res.status(400).json({ message: 'Live Stripe keys are not allowed. Use Stripe Test Mode keys only.' });

  const sig = req.headers['stripe-signature'];
  const payload = req.body;
  const stripe = require('stripe')(process.env.STRIPE_SECRET);
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    const { handleWebhookEvent } = require('./services/billingService');
    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Failed to process webhook', err);
    res.status(500).end();
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  await connectDB(process.env.MONGO_URI);

  const io = new Server(server, {
    cors: {
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
      },
      credentials: true
    }
  });

  // Expose io via app so controllers can emit events
  app.set('io', io);
  global.__io = io;

  const User = require('./models/User');
  const jwtUtils = require('./utils/jwt');

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const payload = jwtUtils.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(payload.sub);
      if (!user) return next(new Error('Authentication error'));
      socket.user = { id: user._id, email: user.email, name: user.name };
      return next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', socket => {
    // Personal room for notifications
    socket.join(String(socket.user.id));
    console.log(`Socket connected: ${socket.user.email}`);

    socket.on('joinWorkspace', async (workspaceId) => {
      try {
        const user = await User.findById(socket.user.id);
        const member = (user.memberships || []).find(m => String(m.workspace) === String(workspaceId));
        if (!member) return socket.emit('error', 'Not a member of workspace');
        socket.join(String(workspaceId));
        console.log(`${socket.user.email} joined workspace ${workspaceId}`);
      } catch (err) {
        socket.emit('error', 'Could not join workspace');
      }
    });

    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(String(workspaceId));
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.email}`);
    });
  });

  const port = process.env.PORT || 4000;
  if (process.env.NODE_ENV !== 'production') {
    server.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
  }
}

// Connect DB outside start() for Vercel cold starts
if (process.env.NODE_ENV === 'production') {
  connectDB(process.env.MONGO_URI);
}

start().catch(err => {
  console.error('Failed to start server:', err);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

module.exports = server;

