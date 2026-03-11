// Jest test for /auth/register using mongodb-memory-server
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/user.model");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("POST /auth/register", () => {
  it("should register a new user", async () => {
    const userData = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    const response = await request(app).post("/auth/register").send(userData);

    expect(response.status).toBe(201); // Expect 201 Created
    expect(response.body).toHaveProperty("username", userData.username);
    expect(response.body).toHaveProperty("email", userData.email);
    // Add more assertions as needed
  });

  it("should not register user with duplicate email", async () => {
    const userData = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
      fullName: {
        firstName: "Test",
        lastName: "User",
      },
    };

    await User.create(userData);

    const response = await request(app).post("/auth/register").send(userData);

    expect(response.status).toBe(400); // Expect 400 Bad Request
    expect(response.body).toHaveProperty("error");
  });
});
