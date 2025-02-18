const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
}, { collection: "budgets" });

budgetSchema.index({ userId: 1, category: 1 }); // Compound index on userId and category

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
