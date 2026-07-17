require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');

const { sequelize } = require('./src/models');
const errorMiddleware = require('./src/middlewares/error.middleware');

const authRoutes = require('./src/routes/auth.routes');
const customerRoutes = require('./src/routes/customer.routes');
const accountRoutes = require('./src/routes/account.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const reportRoutes = require('./src/routes/report.routes');
const settingsRoutes = require('./src/routes/settings.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  abortOnLimit: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use(errorMiddleware);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
