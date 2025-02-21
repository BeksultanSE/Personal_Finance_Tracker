const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");
const User = require("../models/user");
const Token = require("../models/token");

jest.mock('../controllers/mailController', () => ({
    sendActivationMail: jest.fn().mockResolvedValue(true)
}));

let mongoServer;

beforeAll(async () => {
    try {

        mongoServer = await MongoMemoryServer.create(); 
        const uri = mongoServer.getUri();
        try {
            await mongoose.connect(uri);
            console.log('Connected to test database');
        } catch (error) {
            console.error('Error connecting to test database:', error.message);
            throw error;
        }
    } catch (error) {
        console.error('Error connecting to test database:', error.message);
        throw error;
    }
});

afterAll(async () => {
    try {
        await User.deleteMany({});
        await Token.deleteMany({});
        await mongoose.connection.close();
        await mongoServer.stop();
        console.log('Closed database connection');
        await new Promise(resolve => app.listen().close(resolve));
    } catch (error) {
        console.error('Error cleaning up:', error.message);
        throw error;
    }
});

beforeEach(async () => {
    try {
        await User.deleteMany({});
        await Token.deleteMany({});
    } catch (error) {
        console.error('Error in test cleanup:', error.message);
        throw error;
    }
});

describe("Authentication API", () => {
    let testUser = {
        name: "testuser",
        email: "test@example.com",
        password: "password123",
    };

    test("Should register a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("ok", true);
        expect(response.body).toHaveProperty("message", "Activation link is sent to your email, please activate your account!");
    });

    test("Should not allow duplicate email registration", async () => {
        await request(app)
            .post("/api/auth/register")
            .send(testUser);

        const response = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "User  already exists");
    });

    test("Should not allow login before account activation", async () => {
        await request(app)
            .post("/api/auth/register")
            .send(testUser);

        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "User account is not activated, please activate you account via link sent to your email!");
    });

    test("Should reject login with wrong password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: "wrongpassword" });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    test("Should reject login with non-existent email", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "doesnotexist@example.com", password: "password123" });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
});
