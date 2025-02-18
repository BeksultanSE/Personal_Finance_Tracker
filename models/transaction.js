const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100  // Prevents excessively long descriptions
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0  // Ensures no negative values
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  metadata: { 
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'credit_card', 'bank_transfer', 'crypto'], 
      default: 'cash' 
    },
    notes: { 
      type: String, 
      maxlength: 200  // Optional field for extra info
    }
  }
}, { 
  collection: "transactions", 
  timestamps: true  // Adds createdAt & updatedAt fields automatically
});

// 🔹 Optimized Indexes for Performance
transactionSchema.index({ userId: 1, date: -1 });  // Fast lookup by user & recent transactions
transactionSchema.index({ category: 1, date: -1 });  // Optimize category-based queries
transactionSchema.index({ type: 1 });  // Speeds up income/expense filtering
transactionSchema.index({ metadata: 1 });  // Improves metadata searches

// 🔹 Optional: Auto-delete transactions after 2 years
transactionSchema.index({ date: 1 }, { expireAfterSeconds: 63072000 });  // TTL index (2 years)

// 🔹 Indexing for Aggregation Queries
transactionSchema.index({ userId: 1, type: 1, date: -1 });  // Optimizes income/expense aggregation

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
