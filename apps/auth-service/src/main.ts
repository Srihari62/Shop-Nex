import express from "express";
import cors from "cors";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json";
const app = express();
swaggerUi;
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use("/api", router);

app.use(errorMiddleware);
const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth Service is running at http://localhost:${port}/`);
  console.log(`API Docs available at http://localhost:${port}/docs`);
});
server.on("error", (err) => {
  console.log("Server Error : ", err);
});
