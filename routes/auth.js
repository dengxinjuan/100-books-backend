"use strict";

const express = require("express");
const router = new express.Router();
const User = require("../model/users");
const { createToken } = require("../helpers/tokens");
const { ExpressError } = require("../expressError");

/**register route, authoration: None. It will return token
 * * POST /auth/register:   { user } => { token }
 * user must include { username, password, firstName, lastName, email }
 */

router.post("/register", async function (req, res, next) {
  try {
    const newUser = await User.register({ ...req.body });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (error) {
    return next(err);
  }
});

/**{
	"username": "dog",
	"password":"123456",
	"firstName":"dog",
	"lastName":"mark",
	"email":"dog@gmail.com"
	
}
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRvZyIsImlhdCI6MTYxOTk5NTQ0OH0.WbFiJDJEkSsaa1qSybxgrzI3PLigU7zUv2ivPAh6Krc"
}
*/

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    /*const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }*/

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
