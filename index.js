const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const path = require('path');
require("dotenv").config();

// Import routes
const transactionRoutes = require('./routes/transactionRoutes');
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

// Load environment variables
const PORT = process.env.PORT || 5000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const app = express();

// Middleware
app.use(bodyParser.json()); // JSON parser
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Start server
if (process.env.NODE_ENV !== 'test') {
  // Connect to MongoDB
  mongoose.connect(process.env.MongoDbCollection_CONNECTION_URL)
    .then(() => {
      console.log('MongoDB connected');
      // Routes
      app.use('/api/transactions', transactionRoutes);
      app.use('/api/budgets', budgetRoutes);
      app.use('/', pageRoutes);
      app.use('/api/auth', authRoutes);

      // 404 Error Handling
      app.use((req, res) => {
        res.status(404).sendFile(path.join(__dirname, 'public', 'notFound.html'));
      });
    })
    .catch(err => {
      console.log('MongoDB connection error:', err);
      app.use((req, res) => {
        res.status(503).sendFile(path.join(__dirname, 'public', '503.html'));
      });
    });

  app.listen(PORT, () => {
    console.log(`Server running on ${API_URL}`);
  });
}
//For testing only
else { 
  // Routes
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/budgets', budgetRoutes);
  app.use('/', pageRoutes);
  app.use('/api/auth', authRoutes);
}

module.exports = app;