"use strict";

const express = require("express");
const router = new express.Router();

router.get("/", function (req, res, next) {
  try {
    console.log("auth route testing!");
    return res.send("auth route testing!");
  } catch (error) {
    return next(err);
  }
});

module.exports = router;
