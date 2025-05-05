const express = require('express');
const { Sequelize } = require('sequelize');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const orderController = require('./controllers/orderController');
// const whatsappService = require('./services/whatsapp');

const app = express();
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite')
});

// Initialize Order model
const Order = require('./models/Order')(sequelize);

// Initialize controllers with models
const orderControllerWithModel = require('./controllers/orderController')(Order);

// Middleware
app.use(cors({
  origin: '*',
  // origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database setup
sequelize.sync()
  .then(async () => {
    console.log('Database synchronized');
    
    // Check WhatsApp connection
    // try {
    //   const isConnected = await whatsappService.checkConnection();
    //   console.log(`WhatsApp connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    // } catch (error) {
    //   console.error('Error checking WhatsApp connection:', error);
    // }
  })
  .catch(err => {
    console.error('Error synchronizing database:', err);
  });

// Middleware to check admin session
const checkAdminSession = (req, res, next) => {
  if (req.cookies.adminSession) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes
app.post('/orders', orderControllerWithModel.createOrder);
app.get('/orders', orderControllerWithModel.getOrders);
app.get('/orders/:reference', orderControllerWithModel.getOrderByReference);
app.patch('/orders/:reference/status', orderControllerWithModel.updateStatus);

// Auth Route
app.post('/auth', (req, res) => {
  const { passcode } = req.body;
  if (passcode === "1234") {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid passcode' });
  }
});

// Admin routes
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.cookie('adminSession', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/admin/logout', (req, res) => {
  res.clearCookie('adminSession');
  res.json({ success: true });
});

app.get('/admin/check-auth', checkAdminSession, (req, res) => {
  res.json({ authenticated: true });
});

app.get('/', (req, res) => {
  res.send('This is a GET API');
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
