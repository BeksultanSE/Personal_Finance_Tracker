const Transaction = require('../models/transaction');
const mongoose = require('mongoose');

// GET all transactions for the authenticated user with filters, sorting, and pagination
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'date', order = 'desc', type, category } = req.query;
    
    const filter = { userId: req.user.id };
    if (type) filter.type = type; // Filter by income or expense
    if (category) filter.category = category; // Filter by category

    const transactions = await Transaction.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error('Error retrieving transactions:', err);
    res.status(500).json({ message: 'Error retrieving transactions', error: err.message });
  }
};

// POST a new transaction with validation
const createTransaction = async (req, res) => {
  const { description, amount, type, category } = req.body;

  if (!description || !amount || !type || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  const newTransaction = new Transaction({
    description,
    amount,
    type,
    category,
    userId: req.user.id,
  });

  try {
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ message: 'Error creating transaction', error: err.message });
  }
};

// UPDATE a transaction with validation
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { description, amount, type, category } = req.body;

  if (amount && amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { description, amount, type, category },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    res.status(200).json({ message: 'Transaction updated successfully', transaction });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ message: 'Error updating transaction', error: err.message });
  }
};

// DELETE a transaction with error handling
const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ message: 'Error deleting transaction', error: err.message });
  }
};

// GET transactions within a specific date range
const getTransactionsInRange = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start and end dates are required' });
  }

  try {
    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    console.error('Error fetching transactions in range:', err);
    res.status(500).json({ message: 'Error retrieving transactions', error: err.message });
  }
};

// GET total income grouped by category
const getTotalIncome = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start and end dates are required' });
  }

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const results = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          type: 'income',
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1
        }
      }
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error('Error calculating total income:', err);
    res.status(500).json({ message: 'Error calculating total income', error: err.message });
  }
};

// GET total expenses grouped by category
const getTotalExpenses = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start and end dates are required' });
  }

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const results = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          type: 'expense',
        }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1
        }
      }
    ]);

    res.status(200).json(results);
  } catch (err) {
    console.error('Error calculating total expenses:', err);
    res.status(500).json({ message: 'Error calculating total expenses', error: err.message });
  }
};

// Bulk insert transactions
const bulkInsertTransactions = async (req, res) => {
  try {
    const transactions = req.body.transactions;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: 'Invalid transactions data' });
    }

    const insertedTransactions = await Transaction.insertMany(transactions);
    res.status(201).json({ message: 'Transactions inserted successfully', transactions: insertedTransactions });
  } catch (err) {
    console.error('Error inserting transactions:', err);
    res.status(500).json({ message: 'Error inserting transactions', error: err.message });
  }
};

// Bulk update transactions
const bulkUpdateTransactions = async (req, res) => {
  try {
    const { filter, updateData } = req.body;
    if (!filter || !updateData) {
      return res.status(400).json({ message: 'Filter and updateData are required' });
    }

    const updateResult = await Transaction.updateMany(filter, { $set: updateData });
    res.status(200).json({ message: 'Transactions updated successfully', result: updateResult });
  } catch (err) {
    console.error('Error updating transactions:', err);
    res.status(500).json({ message: 'Error updating transactions', error: err.message });
  }
};

// Bulk delete transactions
const bulkDeleteTransactions = async (req, res) => {
  try {
    const { filter } = req.body;
    if (!filter) {
      return res.status(400).json({ message: 'Filter is required' });
    }

    const deleteResult = await Transaction.deleteMany(filter);
    res.status(200).json({ message: 'Transactions deleted successfully', result: deleteResult });
  } catch (err) {
    console.error('Error deleting transactions:', err);
    res.status(500).json({ message: 'Error deleting transactions', error: err.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsInRange,
  getTotalIncome,
  getTotalExpenses,
  bulkInsertTransactions,
  bulkUpdateTransactions,
  bulkDeleteTransactions,
};
