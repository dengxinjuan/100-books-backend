"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors"); // it is a package for cors mutiple options

const { NotFoundError } = require("./expressError");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const { authenticateJWT } = require("./middleware/authMiddle");

//const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json()); // tell app to use json
//app.use(morgan("tiny"));
app.use(authenticateJWT); //get auth token for all route

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
