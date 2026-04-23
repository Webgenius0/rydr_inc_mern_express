/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import notFound from "./app/middlewares/notFound";
import rydrRoutes from "./app/routes/rydr.routes";
import driverRoutes from "./app/routes/driver.routes";
import dashboardRoutes from "./app/routes/dashboard.routes";
import uploadRoutes from "./app/routes/upload.routes";

const app: Application = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://fadicycle-mern-frontend.netlify.app",
      "https://fedicycle-admin-dashboard-client-si.vercel.app",
      "https://fadicycle-mern-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options("*", cors());

app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/rydr", rydrRoutes);
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/file", uploadRoutes);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    statusCode: httpStatus.OK,
    message: "Welcome to Rydr Backend API",
    data: {
      service: "Rydr Backend API",
      version: "1.0.0",
      description:
        "Rydr_Ink is a platform that connects customers with local service providers for various services.",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      endpoints: {
        health: "/health",
        api: "/api/v1",
      },
    },
  });
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  const healthCheck = {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service is healthy",
    data: {
      status: "UP",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      service: {
        name: "Rydr API",
        version: "1.0.0",
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
          used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        },
        cpu: process.cpuUsage(),
      },
    },
  };

  res.status(httpStatus.OK).json(healthCheck);
});

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use(notFound);

export default app;
