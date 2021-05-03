"use strict";

const express = require("express");
const router = new express.Router();
const User = require("../model/users");
const { createToken } = require("../helpers/tokens");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const userRegisterSchema = require("../json_schema.js/userRegisterSchema.json");
const userAuth = require("../json_schema.js/userAuth.json");

/**register route, authoration: None. It will return token
 * * POST /auth/register:   { user } => { token }
 * user must include { username, password, firstName, lastName, email }
 * {
	"username": "dog",
	"password":"123456",
	"firstName":"dog",
	"lastName":"mark",
	"email":"dog@gmail.com"
}
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const newUser = await User.register({ ...req.body });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (error) {
    return next(error);
  }
});

/** POST /auth/token:  { username, password } => { token }
 * {"username":"dog",
 * "password":"123456"}
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuth);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      console.log(errs);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
