import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  coinId: { 
    type: String, 
    required: true 
  },
  coinName: { 
    type: String, 
    required: true 
  },
  coinSymbol: { 
    type: String, 
    required: true 
  },
  coinImage: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['buy', 'sell'], 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0.000001
  },
  pricePerCoin: { 
    type: Number, 
    required: true,
    min: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  notes: { 
    type: String, 
    maxLength: 500 
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ userId: 1, coinId: 1 });
transactionSchema.index({ userId: 1, date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;