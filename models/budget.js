const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 50  // limit for length
  },
  limit: { 
    type: Number, 
    required: true, 
    min: 0  // it is required to give non-negative amount
  }
}, { collection: "budgets" });

budgetSchema.index({ userId: 1, category: 1 }); // Compound index on userId and category

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
