import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initializeSiteConfig";
import { error, timeStamp } from "console";

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? [
      "https://shopnexnow.store",
      "https://seller.shopnexnow.store",
      "https://admin.shopnexnow.store",
      "http://ngnix",
      "http://localhost",
    ]
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  cors({
    origin: allowedOrigins,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.set("trust proxy", isProduction ? "loopback" : 1);

// rate limiting application
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: (req: any) => (req.user ? 1000 : 10), // limit each IP to 100 requests per windowMs
//   message: { error: "Too many requests from this IP, please try again later" },
//   standardHeaders: true,
//   legacyHeaders: true,
//   keyGenerator: (req: any) => req.user?.id || req.ip,

//   // keyGenerator: (req: any) => req.ip,
// });

// app.use(limiter);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { error: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === "/gateway-health";
  },
});

app.use(limiter);

app.get("/gateway-health", (req, res) => {
  res.status(200).json({
    message: "API Gateway is healthy",
    timeStamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

//Service URL COnfig

const getServiceUrl = (serviceName: string, port: number) => {
  if (isProduction) {
    return `http://${serviceName}:${port}`;
  } else {
    return `http://localhost:${port}`;
  }
};

const createProxyMiddleware = (serviceUrl: string, serviceName: string) => {
  return proxy(serviceUrl, {
    timeout: 30000,
    proxyReqOptDecorator: (
      proxyReqOpts: { headers: any },
      srcReq: { ip: any; get: (argo: string) => any },
    ) => {
      proxyReqOpts.headers!["X-Forwarded-For"] = srcReq.ip;
      proxyReqOpts.headers!["X-Original-Host"] = srcReq.get("host");
      return proxyReqOpts;
    },
    proxyErrorHandler: (err: any, res: any, next: any) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({
          error: "Service unavailable",
          service: serviceName,
          timestamp: new Date().toISOString(),
        });
      }
    },
  });
};

app.use(
  "/recommendation",
  createProxyMiddleware(
    getServiceUrl("recommendation-service", 6007),
    "recommendation-service",
  ),
);
app.use(
  "/chatting",
  createProxyMiddleware(
    getServiceUrl("chatting-service", 6006),
    "chatting-service",
  ),
);
app.use(
  "/admin",
  createProxyMiddleware(getServiceUrl("admin-service", 6005), "admin-service"),
);
app.use(
  "/order",
  createProxyMiddleware(getServiceUrl("order-service", 6004), "order-service"),
);
// app.use("/seller", proxy("http://localhost:6003"));
app.use(
  "/product",
  createProxyMiddleware(
    getServiceUrl("product-service", 6002),
    "product-service",
  ),
);
app.use(
  "/auth",
  createProxyMiddleware(getServiceUrl("auth-service", 6001), "auth-service"),
);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.log(err.message);
    if (!res.headersSent) {
      res.status(503).json({
        error: isProduction ? "Internal Server Error" : err.message,
        timestamp: new Date().toISOString(),
      });
    }
  },
);

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 8080;
const host = isProduction ? "0.0.0.0" : "localhost";

const server = app.listen(Number(port), host, () => {
  console.log(`API Gateway listening at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS Originn: ${JSON.stringify(allowedOrigins)}`);

  try {
    initializeSiteConfig();
    console.log("Site config initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize site config:", error);
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

server.on("error", (error: any) => {
  console.error("Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});
