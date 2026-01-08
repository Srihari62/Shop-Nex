import express from "express";
import cors from "cors";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import router from "./routes/product.routes";
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
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use("/api", router);

app.use(errorMiddleware);
const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Product Service is running at http://localhost:${port}/`);
  console.log(`API Docs available at http://localhost:${port}/docs`);
});
server.on("error", (err) => {
  console.log("Server Error : ", err);
});
