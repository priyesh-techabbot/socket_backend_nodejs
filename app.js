import express from "express";
import morgan from "morgan";
import { config } from "dotenv";
import pkg from "body-parser";
const { json } = pkg;

// Import API routes
import serviceRouters from "./api/service.js";

const app = express();

// config env file
config();

// Logging every http
app.use(morgan(":method :url :status - :response-time ms IP-:remote-addr"));

// Read json body
app.use(json({ limit: "50mb" }));

// Get real ip
app.set("trust proxy", true);

// Ignore favicon
function ignoreFavicon(req, res, next) {
  if (req.originalUrl.includes("favicon.ico")) {
    res.status(204).end();
  } else {
    next();
  }
}
app.use(ignoreFavicon);

// CORS handling [IMPORTANT]
app.use((reg, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

// Apply API routes
app.use("/service", serviceRouters);

// Handle 404 globally
app.use((request, response, next) => {
  var error = Error("Not found");
  error.status = 404;
  next(error);
});

// Handle API exception globally
app.use((error, request, response, next) => {
  console.log(error);
  response.status(error.status || 500);
  response.json({
    message: error.message,
  });
});

export default app;
