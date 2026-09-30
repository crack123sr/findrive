import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { httpStatus } from "../config/http.config.js";
import { errorHandler } from "../middlewares/errorhandler.middleware.js";
import { BadRequestException } from "../utils/app-error.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import connectDatabase from "../config/database.config.js";
import authRoutes from "../routes/auth.routes.js";
import passport from "passport";
import "../config/passport.config.js";
import { passportAuthenticateJwt } from "../config/passport.config.js";
import  userRoutes  from "../routes/user.routes.js";
import transactionRoutes from "../routes/transaction.route.js";
//import { startJob } from "../cron/scheduler.js";
import { initializeCrons } from "../cron/index.js";
import reportRoutes from "../routes/report.route.js";
import analyticsRoutes from "../routes/analytics.route.js";
import subscriptionRoutes from '../routes/subscription.routes.js';
import webhookRoutes from '../routes/webhook.routes.js';


const app = express();
const BASE_PATH = "/api/v1";

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

app.get(
    "/",
    asyncHandler(async (req, res) => {
        throw new BadRequestException("This is a test error"); // Simulating an error for testing the error handler
        res.status(httpStatus.OK).json({
            message: "Hello, World!",
        });
    })
);

//startJob();

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt,transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.use(`${BASE_PATH}/webhooks`, passportAuthenticateJwt,webhookRoutes);
app.use(`${BASE_PATH}/subscriptions`,passportAuthenticateJwt, subscriptionRoutes);


app.use(errorHandler);

app.listen(process.env.PORT, async () => {
    await connectDatabase();


    if (process.env.NODE_ENV === "development") {
        await initializeCrons();
    }











    console.log(`Server is running on port ${process.env.PORT}`);
});