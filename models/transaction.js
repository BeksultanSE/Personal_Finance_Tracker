const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 100  
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0  
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
  }
}, { 
  collection: "transactions", 
  timestamps: true 
});

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;