const Transaction = require('../models/transaction');
const mongoose = require('mongoose');

// GET all transactions for the authenticated user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving transactions', error: err });
  }
};

// POST a new transaction for the authenticated user
const createTransaction = async (req, res) => {
  const { description, amount, type, category } = req.body;

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
    res.status(500).json({ message: 'Error creating transaction', error: err });
  }
};
// Other methods (updateTransaction, deleteTransaction) remain similar but should verify ownership
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { description, amount, type, category } = req.body;

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Ensure the user owns the transaction
      { description, amount, type, category },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Error updating transaction', error: err });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting transaction', error: err });
  }
};

const getTransactionsInRange = async (req, res) => {
  const { startDate, endDate } = req.body;
  try {
    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error calculating transactions in some specific range', error: err.message });
  }
  /*
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  try {
    const transactions = await Transaction.find({ userId: req.user._id, date: { $gte: lastMonth } });
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const categoryExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const categoryIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    res.status(200).json({
      totalIncome,
      totalExpenses,
      categoryExpenses,
      categoryIncome
    });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating statistics', error: err });
  }*/
};

const getTotalIncome = async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const results = await Transaction.aggregate(
      [
        {
          $match: {
            userId: userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
            type: 'income' // Filter for expense transactions
          }
        },
        {
          $group: {
            _id: "$category", // Group by category
            totalAmount: { $sum: "$amount" } // Sum the amounts
          }
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            totalAmount: 1
          }
        }
      ]
    );

    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error calculating total income', error: err.message });
  }
};

const getTotalExpenses = async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const results = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          type: 'expense' // Filter for expense transactions
        }
      },
      {
        $group: {
          _id: "$category", // Group by category
          totalAmount: { $sum: "$amount" } // Sum the amounts
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
    res.status(500).json({ message: 'Error calculating total expenses', error: err.message });
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
};
