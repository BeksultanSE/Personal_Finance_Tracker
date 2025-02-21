const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/user');
const Budget = require('../models/budget');
const { generateTokens } = require('../controllers/tokenController');

describe('Budget API', () => {
    let authToken;
    let userId;
    let testBudget;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        // Create a test user
        const user = new User({
            name: 'Test User',
            email: 'test@budget.com',
            password: 'password123',
            isActivated: true
        });
        await user.save();
        userId = user._id;

        // Generate tokens for authentication
        const tokens = generateTokens({ id: user._id });
        authToken = tokens.accessToken;
    });

    beforeEach(async () => {
        // Create a test budget before each test
        testBudget = new Budget({
            userId: userId,
            category: 'Food',
            limit: 1000
        });
        await testBudget.save();
    });

    afterEach(async () => {
        // Clean up budgets after each test
        await Budget.deleteMany({});
    });

    afterAll(async () => {
        // Clean up users after all tests
        await User.deleteMany({});
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    // Test creating a budget
    describe('POST /api/budgets', () => {
        it('should create a new budget', async () => {
            const res = await request(app)
                .post('/api/budgets')
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    category: 'Entertainment',
                    limit: 500
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.budget.category).toBe('Entertainment');
            expect(res.body.budget.limit).toBe(500);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/budgets')
                .send({
                    category: 'Entertainment',
                    limit: 500
                });

            expect(res.statusCode).toBe(401);
        });
    });

    // Test getting budgets
    describe('GET /api/budgets', () => {
        it('should get all budgets for authenticated user', async () => {
            const res = await request(app)
                .get('/api/budgets')
                .set('Cookie', [`accessToken=${authToken}`]);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(1);
            expect(res.body[0].category).toBe('Food');
        });
    });

    // Test updating a budget
    describe('PUT /api/budgets/:id', () => {
        it('should update an existing budget', async () => {
            const res = await request(app)
                .put(`/api/budgets/${testBudget._id}`)
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    category: 'Food',
                    limit: 1500
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.limit).toBe(1500);
        });

        it('should fail to update non-existent budget', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/budgets/${fakeId}`)
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    category: 'Food',
                    limit: 1500
                });

            expect(res.statusCode).toBe(404);
        });
    });

    // Test deleting a budget
    describe('DELETE /api/budgets/:id', () => {
        it('should delete an existing budget', async () => {
            const res = await request(app)
                .delete(`/api/budgets/${testBudget._id}`)
                .set('Cookie', [`accessToken=${authToken}`]);

            expect(res.statusCode).toBe(200);

            // Verify budget was deleted
            const deletedBudget = await Budget.findById(testBudget._id);
            expect(deletedBudget).toBeNull();
        });
    });
}); 