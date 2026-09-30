import express from "express";
const { request, response } = express;
import { httpStatus } from "../config/http.config.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginService, registerService } from "../services/auth.service.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js"

export const registerController = asyncHandler(
  async (req, res) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(httpStatus.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req, res) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(httpStatus.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  }
);