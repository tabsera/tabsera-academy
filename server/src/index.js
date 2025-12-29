/**
 * Tabsera Academy API Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Make prisma available in routes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const packsRoutes = require('./routes/packs');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const enrollmentsRoutes = require('./routes/enrollments');
const edxRoutes = require('./routes/edx');
const uploadRoutes = require('./routes/upload');
const centersRoutes = require('./routes/centers');
const countriesRoutes = require('./routes/countries');
const subjectsRoutes = require('./routes/subjects');
const tutorsRoutes = require('./routes/tutors');
const webhooksRoutes = require('./routes/webhooks');

// Webhooks need raw body for signature verification - mount before json middleware
app.use('/api/webhooks', webhooksRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/packs', packsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/edx', edxRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/tutors', tutorsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public tuition packs endpoint
app.get('/api/tuition-packs', async (req, res, next) => {
  try {
    const packs = await prisma.tuitionPack.findMany({
      where: { isActive: true },
      orderBy: [{ price: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        creditsIncluded: true,
        validityDays: true,
        price: true,
      },
    });

    res.json({ success: true, packs });
  } catch (err) {
    next(err);
  }
});

// WaafiPay HPP callback handler (POST to /payment/callback)
// This handles POST requests from WaafiPay and redirects to frontend
app.post('/payment/callback', (req, res) => {
  console.log('WaafiPay HPP callback received:', req.body);
  console.log('Query params:', req.query);

  // Get status and reference from query or body
  const status = req.query.status || req.body.status || 'unknown';
  const ref = req.query.ref || req.body.referenceId || req.body.ref || '';

  // Build redirect URL with all query params preserved
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const queryString = new URLSearchParams(req.query).toString();
  const redirectUrl = `${frontendUrl}/payment/callback?${queryString}`;

  console.log('Redirecting to:', redirectUrl);

  // Redirect to frontend (302 redirect changes POST to GET)
  res.redirect(302, redirectUrl);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Verify email connection
  if (process.env.SMTP_HOST) {
    const { verifyConnection } = require('./services/email');
    await verifyConnection();
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
