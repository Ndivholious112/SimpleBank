const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Allow negative amounts for "send" and positive amounts for "receive"
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'ZAR' },
    description: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
