const express = require('express');
const connectDB = require("./config/db");
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

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // JSON parser
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/', pageRoutes);
app.use('/api/auth', authRoutes);

// 404 Error Handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'notFound.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on ${API_URL}`);
});
