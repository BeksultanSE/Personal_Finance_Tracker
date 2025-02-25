const express = require('express');
const { body } = require('express-validator');
const {
    registerUser,
    loginUser,
    logoutUser,
    refreshUser,
    activateUser,
    getUser,
    updateUser,
    deleteUser
} = require('../controllers/authController'); // Import the functions
const authenticate = require('../middleware/authMiddleware'); // Import auth middleware
const roleMiddleware = require('../middleware/roleMiddleware'); // Import role middleware
const User = require('../models/user'); // Import User model

const router = express.Router();

// Registration endpoint
router.post(
    '/register',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Valid email is required').isEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    registerUser
);

// Login endpoint
router.post(
    '/login',
    [
        body('email', 'Valid email is required').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    loginUser
);

// Logout endpoint
router.post('/logout', logoutUser);

// Token refresh endpoint
router.get('/refresh', refreshUser);

// Activation endpoint
router.get('/activate/:link', activateUser);

// 🚀 **NEW: Admin-only Route to View All Users**
router.get('/all-users', authenticate, roleMiddleware('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Fetch users excluding passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this route for fetching account data
router.get('/account', authenticate, getUser);

// Add update account route
router.put('/account', authenticate, updateUser);


module.exports = router;
