import "dotenv/config";
import app from "./validators/index.js";
import connectDatabase from "./config/database.config.js";

export default app;
export const config = { api: { bodyParser: false } };

if (process.env.VERCEL !== "1") {
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, async () => {
    try {
      await connectDatabase();

      if (process.env.NODE_ENV === "development") {
        const { initializeCrons } = await import("./cron/index.js");
        await initializeCrons();
      }

      console.log(`Server is running on port ${port}`);
    } catch (error) {
      console.error("Server startup failed:", error);
      server.close(() => {
        process.exitCode = 1;
      });
    }
  });
}
