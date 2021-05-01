const express = require("express");

const router = new express.Router();

router.get("/", function (req, res, next) {
  try {
    console.log("homepage!");
    return res.send("homepage! testing the basic setting!");
  } catch (error) {
    return next(err);
  }
});

module.exports = router;
