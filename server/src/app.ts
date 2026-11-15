import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { readUser } from "./lib/auth.js";
import authRoutes from "./routes/auth.js";
import serviceRoutes from "./routes/services.js";
import appointmentRoutes from "./routes/appointments.js";
import invoiceRoutes from "./routes/invoices.js";
import dashboardRoutes from "./routes/dashboard.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(readUser);

  app.use("/api/auth", authRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/invoices", invoiceRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  // Anything that throws ends up here
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
