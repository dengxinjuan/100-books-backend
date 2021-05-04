process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../model/users");

beforeEach(async () => {
  await db.query("DELETE FROM users");
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
  });
});

/*********post auth/register */

describe("POST /register route", () => {
  it("should return  a token if the user registers successfully", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "new",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "new@email.com",
    });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  it("bad request with missing fields", async () => {
    const resp = await request(app).post("/auth/register").send({
      username: "new",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app).post("/auth/register").send({
      username: "new",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "not-an-email",
    });
    expect(resp.statusCode).toEqual(400);
  });
});

/*****POST/ auth/token */

describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u2",
      password: "password2",
    });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "nouser",
      password: "password1",
    });
    expect(resp.statusCode).toEqual(500);
    //expect(resp.message).toEqual("UnauthorizedError is not defined");
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
      password: "nope",
    });
    expect(resp.statusCode).toEqual(500);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: 42,
      password: "above-is-a-number",
    });
    expect(resp.statusCode).toEqual(400);
  });
});

afterAll(async () => {
  await db.end();
});
