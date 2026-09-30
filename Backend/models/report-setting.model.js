import mongoose from "mongoose";



const reportSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    frequency: {
      type: String,
      enum: ["MINUTELY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      default: "MONTHLY",
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    nextReportDate: {
      type: Date,
    },
    lastSentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ReportSettingModel = mongoose.model(
  "ReportSetting",
  reportSettingSchema
);

export default ReportSettingModel;