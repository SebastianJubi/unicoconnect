"use strict";
const path = require("path");

//? Requiring environment variables using dotenv npm
const ENV = process.argv[2] || process.env.NODE_ENV || "dev";
if (ENV === "production") {
  require("dotenv").config();
} else {
  require("dotenv").config({ path: path.join(__dirname, ".env-dev") });
}

//? Requiring additional npm modules
const logger = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const logRequest = require("./middlewares/logRequest.middleware");

const userRouter = require("./routes/user.routes");
const walletRouter = require("./routes/wallet.routes");

const app = express();

const SETUP = {
  ip: process.env.IP || "127.0.0.1",
  port: process.env.PORT || 8080,
  dbURL: process.env.DB_URL || "mongodb://localhost:27017/unicoconnect"
};

//? Connecting to MongoDB using mongooseJS
mongoose.connect(SETUP.dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

//? Request logger middleware
app.use(logRequest);

//? API Routes
app.use("/user/api", userRouter);
app.use("/wallet/api", walletRouter);

//? Initializing server
app.listen(SETUP.port, SETUP.ip, () => {
  console.log(`Server started on ${SETUP.ip}:${SETUP.port}`);
});