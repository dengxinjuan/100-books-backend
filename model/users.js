"use strict";

const db = require("../db"); //connect database
const { ExpressError, BadRequestError } = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const { sqlForPartialUpdate } = require("../helpers/sql");

class User {
  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email}, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           ORDER BY username`
    );

    return result.rows;
  }

  /** GET users/[username] => { user }
   *
   * Returns { username, firstName, lastName, reads,wishlist }
   *   where read is [bookid, bookid,bookid]
   * wishlist id [wihslist,wishlist]
   *
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userRead = await db.query(
      `SELECT a.book_id
           FROM reads AS a
           WHERE a.username = $1`,
      [username]
    );

    const userWishlists = await db.query(
      `SELECT a.book_id
             FROM wishlists AS a
             WHERE a.username = $1`,
      [username]
    );

    user.reads = userRead.rows.map((a) => a.book_id);
    user.wishlist = userWishlists.rows.map((a) => a.book_id);
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** mark the book as read, add the book_id to the read table
   * if the username not existed return no username error
   * if the user already mark the book_id as read return already read error
   */
  static async markAsRead(username, bookId) {
    const preCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username]
    );
    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`No username: ${username}`);

    const preCheck2 = await db.query(
      `SELECT book_id FROM reads WHERE username=$1 AND book_id=$2`,
      [username, bookId]
    );
    if (preCheck2.rows[0])
      throw new ExpressError(`${username} already mark as read: ${bookId}`);

    await db.query(
      `INSERT INTO reads (book_id, username)
           VALUES ($1, $2)`,
      [bookId, username]
    );
  }

  /** remove the book_id from read table for specific user
   * if the username doesnt exist return error
   * otherwise delete the username
   */
  static async removeRead(username, bookId) {
    const preCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username]
    );
    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(`DELETE FROM reads WHERE book_id=$1 AND username=$2`, [
      bookId,
      username,
    ]);
  }
  /**wishlist  */
  /** add book_id to user wishlist*/
  static async addWish(username, bookId) {
    const preCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username]
    );
    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`No username: ${username}`);

    const preCheck2 = await db.query(
      `SELECT book_id FROM wishlists WHERE username=$1 AND book_id=$2`,
      [username, bookId]
    );
    if (preCheck2.rows[0])
      throw new ExpressError(`${username} already mark as wish: ${bookId}`);

    await db.query(
      `INSERT INTO wishlists (book_id, username)
           VALUES ($1, $2)`,
      [bookId, username]
    );
  }

  /**remove book_id from user wishlist */
  static async removeWish(username, bookId) {
    const preCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username]
    );
    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(`DELETE FROM wishlists WHERE book_id=$1 AND username=$2`, [
      bookId,
      username,
    ]);
  }
  /** LOG IN LOG OUT AUTHS FUNCTIONS HERE*/

  /**register function */
  /*** the duplicated check function doesnt work and i dont know why */

  static async register({ username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    } else {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

      const result = await db.query(
        `INSERT INTO users
       (username,
        password,
        first_name,
        last_name,
        email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING username, first_name AS "firstName", last_name AS "lastName", email`,
        [username, hashedPassword, firstName, lastName, email]
      );

      const user = result.rows[0];

      return user;
    }
  }

  /***authenticate user with username password */
  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /***update profile function */

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * ## You couldnt change username!!!
   *
   * Data can include:
   *   { firstName, lastName, password, email}
   *
   * Returns { username, firstName, lastName, email }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                        SET ${setCols} 
                        WHERE username = ${usernameVarIdx} 
                        RETURNING username,
                                  first_name AS "firstName",
                                  last_name AS "lastName",
                                  email`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }
}

module.exports = User;
