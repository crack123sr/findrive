import mongoose from "mongoose";
import { convertToCents, convertToDollarUnit } from "../utils/format-currency.js";





const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      set: (value) => convertToCents(value),
      get: (value) => convertToDollarUnit(value),
    },

    description: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringInterval: {
      type: String,
      enum: ['MINUTELY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
      default: null,
    },
    nextRecurringDate: {
      type: Date,
      default: null,
    },
    lastProcessed: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
  
   
    },
    paymentMethod: {
      type: String,
     
      
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

const TransactionModel = mongoose.model(
  "Transaction",
  transactionSchema
);

export default TransactionModel;