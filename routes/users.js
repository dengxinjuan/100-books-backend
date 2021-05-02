const express = require("express");
const { route } = require("../app");
const User = require("../model/users");

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
    return next(err);
  }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * loggedin required
 **/

router.delete("/:username", async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});
/**read route */
/** add a read book id to the specific user*/
router.post("/:username/read/:id", async function (req, res, next) {
  try {
    const bookId = req.params.id;
    await User.markAsRead(req.params.username, bookId);
    return res.json({ read: bookId });
  } catch (err) {
    return next(err);
  }
});

/** remove a read book id to the specific user*/
router.delete("/:username/unread/:id", async function (req, res, next) {
  try {
    const bookId = req.params.id;
    await User.removeRead(req.params.username, bookId);
    return res.json({ unread: bookId });
  } catch (err) {
    return next(err);
  }
});

/**wish route */
/** add a wish book id to the specific user*/
router.post("/:username/wish/:id", async function (req, res, next) {
  try {
    const bookId = req.params.id;
    await User.addWish(req.params.username, bookId);
    return res.json({ wish: bookId });
  } catch (err) {
    return next(err);
  }
});

/** remove a wishlist book id to the specific user*/
router.delete("/:username/unwish/:id", async function (req, res, next) {
  try {
    const bookId = req.params.id;
    await User.removeWish(req.params.username, bookId);
    return res.json({ unwish: bookId });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
