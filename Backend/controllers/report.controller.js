import express from "express";
const { Request, Response } = express;
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { httpStatus } from "../config/http.config.js";
import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service.js";
import { updateReportSettingSchema } from "../validators/report.validator.js";
import ReportModel, { ReportStatusEnum } from "../models/report-model.js";

export const getAllReportsController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;

    const pagination = {
      pageSize: parseInt(String(req.query.pageSize)) || 20,
      pageNumber: parseInt(String(req.query.pageNumber)) || 1,
    };

    const result = await getAllReportsService(userId, pagination);

    return res.status(httpStatus.OK).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  }
);

export const updateReportSettingController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportSettingService(userId, body);

    return res.status(httpStatus.OK).json({
      message: "Reports setting updated successfully",
    });
  }
);

export const generateReportController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const { from, to } = req.query;
    const fromDate = new Date(String(from));
    const toDate = new Date(String(to));

    const result = await generateReportService(userId, fromDate, toDate);

    if (result) {
      await ReportModel.create({
        userId,
        period: result.period,
        sentDate: new Date(),
        status: ReportStatusEnum.SENT,
      });
    }

    return res.status(httpStatus.OK).json({
      message: "Report generated successfully",
      ...(result || {}),
    });
  }
);
