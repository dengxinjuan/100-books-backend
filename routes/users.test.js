process.env.NODE_ENV = "test";
const request = require("supertest");
const User = require("../model/users");
const app = require("../app");
const db = require("../db.js");
const { createToken } = require("../helpers/tokens");

beforeEach(async () => {
  await db.query("DELETE FROM users");
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
  });

  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
  });

  await User.addWish("u2", "1");
  await User.addWish("u2", "2");
  await User.markAsRead("u2", "3");
  await User.markAsRead("u2", "4");
});

afterEach(async () => {
  await db.query("ROLLBACK");
});

const u2Token = createToken({ username: "u2" });

describe("GET /users", function () {
  test("get all users", async function () {
    const resp = await request(app).get("/users");
    expect(resp.body).toEqual({
      users: [
        {
          username: "u2",
          firstName: "U2F",
          lastName: "U2L",
          email: "user2@user.com",
        },
        {
          username: "u3",
          firstName: "U3F",
          lastName: "U3L",
          email: "user3@user.com",
        },
      ],
    });
  });

  test("get users info for one user", async function () {
    const resp = await request(app).get("/users/u2");
    expect(resp.body).toEqual({
      users: {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        reads: ["3", "4"],
        wishlist: ["1", "2"],
      },
    });
  });

  test("delete users by username", async function () {
    const resp = await request(app)
      .delete("/users/u2")
      .send({ _token: u2Token });
    console.log(resp);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "u2" });
  });

  test("add users the read id", async function () {
    const resp = await request(app)
      .post("/users/u2/read/33333")
      .send({ _token: u2Token });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ read: "33333" });
  });

  test("remove users the read id", async function () {
    const resp = await request(app)
      .delete("/users/u2/unread/33333")
      .send({ _token: u2Token });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ unread: "33333" });
  });

  test("add users the wish id", async function () {
    const resp = await request(app)
      .post("/users/u2/wish/33333")
      .send({ _token: u2Token });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ wish: "33333" });
  });

  test("remove users the wish id", async function () {
    const resp = await request(app)
      .delete("/users/u2/unwish/33333")
      .send({ _token: u2Token });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ unwish: "33333" });
  });

  test("patch user", async function () {
    const resp = await request(app)
      .patch("/users/u2")
      .send({ firstName: "dengxinjuan", _token: u2Token });
    console.log(resp.body);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u2",
        firstName: "dengxinjuan",
        lastName: "U2L",
        email: "user2@user.com",
      },
    });
  });
});

afterAll(async () => {
  await db.end();
});
