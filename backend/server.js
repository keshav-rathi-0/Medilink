require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./utils/logger');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler'); // added import

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
const PORT = process.env.PORT || 3000; // single declaration

// CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://medilink1.vercel.app';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  FRONTEND_URL,
  'https://medilink1.vercel.app',
  'https://medilink-oajt.onrender.com'
];

// CORS config: must be applied before routes are mounted
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser (curl, Postman) when origin is undefined
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS blocked by server'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}

// apply CORS globally and respond to preflight OPTIONS
app.use(require('cors')(corsOptions))
app.options('*', require('cors')(corsOptions))

// ensure this runs before app.use('/api', ...) routes
// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middlewares
app.use(helmet());
app.use(mongoSanitize());

// Log incoming requests (single middleware)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// API routes
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

// Root & health
app.get('/', (req, res) => res.status(200).json({ message: 'MediLink API', health: '/health' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

// Error handler and 404
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} - env: ${process.env.NODE_ENV || 'development'}`);
});

// Global error listeners
process.on('unhandledRejection', (reason) => {
  logger?.error ? logger.error('Unhandled Rejection', reason) : console.error('Unhandled Rejection', reason);
});

process.on('uncaughtException', (err) => {
  logger?.error ? logger.error('Uncaught Exception', err) : console.error('Uncaught Exception', err);
});

// ensure an Express error handler that returns JSON
app.use((err, req, res, next) => {
  logger?.error ? logger.error('Express error', err) : console.error('Express error', err)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})
