import mongoose from "mongoose";

export const ReportStatusEnum = {
  SENT: "SENT",
  FAILED: "FAILED",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  NO_ACTIVITY: "NO_ACTIVITY",
};

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    period: {
      type: String,
      required: true,
    },
    sentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: ReportStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const ReportModel = mongoose.model("Report", reportSchema);
export default ReportModel;