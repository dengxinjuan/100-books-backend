const express = require("express");
const User = require("../model/users");
const {
  ensureCorrectUser,
  ensureLoggedIn,
} = require("../middleware/authMiddle");

const router = new express.Router();

/** Get request: it will return all users info 
 * 
  "users": [
    {
      "username": "testuser",
      "firstName": "Test",
      "lastName": "User",
      "email": "joel@joelburton.com"
    }
  ]
}
 */

router.get("/", async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (error) {
    return next(err);
  }
});

/** give a username, it will return all user's information
 * logged in required
 */

router.get("/:username", async function (req, res, next) {
  try {
    const users = await User.get(req.params.username);
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * loggedin required
 **/

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});
/**read route */
/** add a read book id to the specific user*/
router.post(
  "/:username/read/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const bookId = req.params.id;
      await User.markAsRead(req.params.username, bookId);
      return res.json({ read: bookId });
    } catch (err) {
      return next(err);
    }
  }
);

/** remove a read book id to the specific user*/
router.delete(
  "/:username/unread/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const bookId = req.params.id;
      await User.removeRead(req.params.username, bookId);
      return res.json({ unread: bookId });
    } catch (err) {
      return next(err);
    }
  }
);

/**wish route */
/** add a wish book id to the specific user*/
router.post(
  "/:username/wish/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const bookId = req.params.id;
      await User.addWish(req.params.username, bookId);
      return res.json({ wish: bookId });
    } catch (err) {
      return next(err);
    }
  }
);

/** remove a wishlist book id to the specific user*/
router.delete(
  "/:username/unwish/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const bookId = req.params.id;
      await User.removeWish(req.params.username, bookId);
      return res.json({ unwish: bookId });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email }
 *
 * Authorization required*/

router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    /*const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }*/

    /*we delete the token from body so we know the ensurecorrect user works*/
    const c = Object.keys(req.body)
      .filter((key) => key !== "_token")
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    //console.log(c);

    const user = await User.update(req.params.username, c);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
