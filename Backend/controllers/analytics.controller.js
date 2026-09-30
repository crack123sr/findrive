import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { httpStatus } from "../config/http.config.js";

import {
  chartAnalyticsService,
  expensePieChartBreakdownService,
  summaryAnalyticsService,
} from "../services/analytics.service.js";

export const summaryAnalyticsController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;

    const { preset, from, to } = req.query;

    const filter = {
      dateRangePreset: preset,
      customFrom: from ? new Date(from) : undefined,
      customTo: to ? new Date(to) : undefined,
    };
    const stats = await summaryAnalyticsService(
      userId,
      filter.dateRangePreset,
      filter.customFrom,
      filter.customTo
    );

    return res.status(httpStatus.OK).json({
      message: "Summary fetched successfully",
      data: stats,
    });
  }
);

export const chartAnalyticsController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const { preset, from, to } = req.query;

    const filter = {
      dateRangePreset: preset,
      customFrom: from ? new Date(from) : undefined,
      customTo: to ? new Date(to) : undefined,
    };

    const chartData = await chartAnalyticsService(
      userId,
      filter.dateRangePreset,
      filter.customFrom,
      filter.customTo
    );

    return res.status(httpStatus.OK).json({
      message: "Chart fetched successfully",
      data: chartData,
    });
  }
);

export const expensePieChartBreakdownController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const { preset, from, to } = req.query;

    const filter = {
      dateRangePreset: preset,
      customFrom: from ? new Date(from) : undefined,
      customTo: to ? new Date(to) : undefined,
    };
    const pieChartData = await expensePieChartBreakdownService(
      userId,
      filter.dateRangePreset,
      filter.customFrom,
      filter.customTo
    );

    return res.status(httpStatus.OK).json({
      message: "Expense breakdown fetched successfully",
      data: pieChartData,
    });
  }
);
