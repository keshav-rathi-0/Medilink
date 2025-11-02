require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./utils/logger'); // existing logger import
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientsRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const wardRoutes = require('./routes/wardRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');
const staffRoutes = require('./routes/staffRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000

// simple CORS allowing your Vercel domain and localhost for dev
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://medilink1.vercel.app'
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', FRONTEND_URL, 'https://medilink1.vercel.app']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true) // allow non-browser (curl)
    return allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('CORS blocked'), false)
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}))

app.use(express.json())

// log incoming requests for debugging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - Origin: ${req.get('Origin') || 'none'}`)
  next()
})

// simple root & health endpoints
app.get('/', (req, res) => res.status(200).json({ message: 'MediLink API', health: '/health' }))
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', ts: new Date().toISOString() }))

// 🧠 Security & middleware
app.use(helmet());
app.use(mongoSanitize());

// 🧱 Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// 🧩 Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🧠 Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// 🛣️ API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboards', dashboardRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple root and health endpoints for Render and quick checks
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'MediLink API', health: '/health' })
});

// Log incoming requests (helpful for CORS/origin debugging)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - Origin: ${req.get('Origin') || 'none'}`)
  next()
});

// ⚠️ Error handler
app.use(errorHandler);

// ⚠️ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Ensure port uses Render's provided PORT
const PORT = process.env.PORT || 3000

// Start server with robust logging
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} - env: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful handling of uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logger?.error ? logger.error('Unhandled Rejection', reason) : console.error('Unhandled Rejection', reason)
  // keep process alive for Render to restart, but log details
})

process.on('uncaughtException', (err) => {
  logger?.error ? logger.error('Uncaught Exception', err) : console.error('Uncaught Exception', err)
  // optional: process.exit(1) // Render will restart; use only if you want immediate exit
})

// ensure an Express error handler that returns JSON
app.use((err, req, res, next) => {
  logger?.error ? logger.error('Express error', err) : console.error('Express error', err)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})
