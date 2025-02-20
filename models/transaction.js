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
  },
  metadata: { 
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'credit_card', 'bank_transfer', 'crypto'], 
      default: 'cash' 
    },
    notes: { 
      type: String, 
      maxlength: 200  
    }
  },
  extraData: { 
    type: mongoose.Schema.Types.Mixed,  // Поддержка произвольных JSON-данных
    default: {} 
  },
  receipt: { 
    type: Buffer  // Хранение бинарных данных (например, чеков)
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