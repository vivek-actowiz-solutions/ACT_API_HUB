const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
// const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/AuthRoutes");
const dashboard = require("./routes/DashboardRoutes");
const apiconfigration = require("./routes/APIConfigreationRoutes");
const apilist = require("./routes/APIListRoutes");
const settings = require("./routes/managementRoutes");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const app = express();
const rateLimit = require("express-rate-limit");

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
];
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

connectDB(); // DB connect

app.use("/api", authRoutes);

app.use("/api", apiconfigration);
app.use("/api", apilist);
app.use("/api", settings);
app.use("/api", dashboard);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(
    `Server running on port http://0.0.0.0:${process.env.PORT} or http://localhost:${process.env.PORT}`
  );
});
