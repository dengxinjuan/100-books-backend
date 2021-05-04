process.env.NODE_ENV = "test";
const request = require("supertest");
const User = require("../model/users");
const app = require("./app");
const db = require("../db.js");
