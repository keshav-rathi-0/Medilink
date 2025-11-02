require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

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

// 🧠 Security & middleware
app.use(helmet());
app.use(mongoSanitize());

// ✅ Configure CORS to allow frontend connections
const corsOptions = {
  origin: [
    'http://localhost:3000', // local development
    'https://medilink-orcin-eta.vercel.app' // deployed frontend on Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

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
  res.status(200).json({ status: 'OK' });
});

// ⚠️ Error handler
app.use(errorHandler);

// ⚠️ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 🚀 Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

module.exports = app;
