import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job.js";
import { processReportJob } from "./jobs/report.job.js";

const scheduleJob = (name, time, job) => {
  console.log(`Scheduling job: ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed `);
      } catch (err) {
        console.error(`Error in ${name}:`, err);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};

export const startJobs = () => {
  return [
    scheduleJob("Transactions", "0 * * * * *", processRecurringTransactions),
    scheduleJob("Reports", "10 * * * * *", processReportJob),
  ];
};