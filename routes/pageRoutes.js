const express = require('express');
const router = express.Router();
const path = require('path');
const authenticate = require('../middleware/authMiddleware');

// Routes for HTML pages
router.get('/', (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'home.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'register.html'));
});

router.get('/dashboard', authenticate, (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'dashboard.html'));
});

router.get('/transactions', authenticate, (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'transactions.html'));
});

router.get('/budgeting', authenticate, (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'budgeting.html'));
});

router.get('/reports', authenticate, (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'reports.html'));
});

router.get('/account', authenticate, (req, res) => {
    res.sendFile(path.join(path.dirname(__dirname), 'public', 'account.html'));
});



module.exports = router;