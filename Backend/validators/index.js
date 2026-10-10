import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { httpStatus } from "../config/http.config.js";
import { errorHandler } from "../middlewares/errorhandler.middleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import connectDatabase from "../config/database.config.js";
import authRoutes from "../routes/auth.routes.js";
import passport from "passport";
import "../config/passport.config.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import  userRoutes  from "../routes/user.routes.js";
import transactionRoutes from "../routes/transaction.route.js";
//import { startJob } from "../cron/scheduler.js";
import reportRoutes from "../routes/report.route.js";
import analyticsRoutes from "../routes/analytics.route.js";
import subscriptionRoutes from '../routes/subscription.routes.js';
import webhookRoutes from '../routes/webhook.routes.js';


const app = express();
const BASE_PATH = "/api/v1";

app.use(`${BASE_PATH}/webhooks/stripe`, express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(
    cors(
        {
            origin: `${process.env.FRONTEND_ORIGIN}`,
            credentials: true
        }
    )
)

app.use(
    asyncHandler(async (_req, _res, next) => {
        await connectDatabase();
        next();
    })
);

app.get("/", (_req, res) => {
    res.status(httpStatus.OK).json({ message: "FinDrive API is running" });
});

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt,transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.use(`${BASE_PATH}/webhooks`, webhookRoutes);
app.use(`${BASE_PATH}/subscriptions`,passportAuthenticateJwt, subscriptionRoutes);


app.use(errorHandler);

export default app;