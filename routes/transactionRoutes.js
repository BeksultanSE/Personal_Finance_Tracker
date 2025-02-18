const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticate = require('../middleware/authMiddleware');

// GET all transactions
router.get('/', authenticate, transactionController.getTransactions);

// POST a new transaction
router.post('/', authenticate, transactionController.createTransaction);

// PUT update a transaction
router.put('/:id', authenticate, transactionController.updateTransaction);

// DELETE a transaction
router.delete('/:id', authenticate, transactionController.deleteTransaction);

// POST range and Get transactions in that specific range 
router.post('/inRange', authenticate, transactionController.getTransactionsInRange);

router.post('/inRange/income', authenticate, transactionController.getTotalIncome);

router.post('/inRange/expenses', authenticate, transactionController.getTotalExpenses);

module.exports = router;
