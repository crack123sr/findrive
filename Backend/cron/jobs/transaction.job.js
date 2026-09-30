import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model.js";
import { calculateNextOccurrence } from "../../utils/helper.js";

export const processRecurringTransactions = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    console.log("Starting recurring process");

    for await (const tx of transactionCursor) {
      try {
        // The transaction should be created NOW.
        // Do not use an old nextRecurringDate as the transaction date.
        const transactionDate = now;

        // Schedule the next occurrence one interval after NOW.
        const nextDate = calculateNextOccurrence(
          now,
          tx.recurringInterval
        );

        const session = await mongoose.startSession();

        try {
          await session.withTransaction(
            async () => {
              // Create the actual transaction
              await TransactionModel.create(
                [
                  {
                    ...tx.toObject(),

                    _id: new mongoose.Types.ObjectId(),

                    title: `Recurring - ${tx.title}`,

                    // IMPORTANT:
                    // Use current time so the report for this minute
                    // can find this transaction.
                    date: transactionDate,

                    // The generated transaction itself is NOT recurring.
                    isRecurring: false,

                    nextRecurringDate: null,
                    recurringInterval: null,

                    lastProcessed: now,

                    createdAt: undefined,
                    updatedAt: undefined,
                  },
                ],
                { session }
              );

              // Update the recurring template
              await TransactionModel.updateOne(
                { _id: tx._id },
                {
                  $set: {
                    // Next occurrence is one interval from NOW
                    nextRecurringDate: nextDate,

                    lastProcessed: now,
                  },
                },
                { session }
              );
            },
            {
              maxCommitTimeMS: 20000,
            }
          );

          processedCount++;
        } finally {
          await session.endSession();
        }
      } catch (err) {
        failedCount++;

        console.error(
          `Failed recurring transaction ${tx._id}:`,
          err
        );
      }
    }

    console.log(`Processed: ${processedCount} transaction`);
    console.log(`Failed: ${failedCount} transaction`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (err) {
    console.error(
      "Error processing recurring transaction:",
      err
    );

    return {
      success: false,
      processedCount,
      failedCount,
      error: err?.message || "Unknown recurring transaction error",
    };
  }
};