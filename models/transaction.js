const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { collection: "transactions" });

transactionSchema.index({ userId: 1, date: -1 }); // Index for userId and date

const Transaction = mongoose.model('Transaction', transactionSchema);


module.exports = Transaction;
