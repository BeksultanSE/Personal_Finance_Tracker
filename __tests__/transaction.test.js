const request = require('supertest');
const app = require('../index');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { generateTokens } = require('../controllers/tokenController');

describe('Transaction API', () => {
    let authToken;
    let userId;
    let testTransaction;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        // Create a test user
        const user = new User({
            name: 'Test User',
            email: 'test@transaction.com',
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
        // Create a test transaction before each test
        testTransaction = new Transaction({
            userId: userId,
            description: 'Test Transaction',
            amount: 100,
            type: 'expense',
            category: 'Food'
        });
        await testTransaction.save();
        
        await Transaction.create([
            { userId, description: 'Transaction 1', amount: 100, type: 'income', category: 'Salary' },
            { userId, description: 'Transaction 2', amount: 50, type: 'expense', category: 'Food' },
            { userId, description: 'Transaction 3', amount: 75, type: 'expense', category: 'Transport' }
        ]);
    });

    afterEach(async () => {
        // Clean up transactions after each test
        await Transaction.deleteMany({});
    });

    afterAll(async () => {
        // Clean up users after all tests
        await User.deleteMany({});
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    // Test creating a transaction
    describe('POST /api/transactions', () => {
        it('should create a new transaction', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    description: 'New Transaction',
                    amount: 50,
                    type: 'income',
                    category: 'Salary'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.transaction.description).toBe('New Transaction');
            expect(res.body.transaction.amount).toBe(50);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .send({
                    description: 'New Transaction',
                    amount: 50,
                    type: 'income',
                    category: 'Salary'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    // Test getting transactions
    describe('GET /api/transactions', () => {
        it('should get all transactions for authenticated user', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Cookie', [`accessToken=${authToken}`]);
    
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.transactions)).toBeTruthy();
            expect(res.body.transactions.length).toBe(4); 
            expect(res.body.totalPages).toBe(1); // Expecting 1 page
            expect(res.body.currentPage).toBe(1); // Expecting current page to be 1
        });
    
        it('should filter transactions by type', async () => {
            const res = await request(app)
                .get('/api/transactions?type=expense')
                .set('Cookie', [`accessToken=${authToken}`]);
    
            expect(res.statusCode).toBe(200);
            expect(res.body.transactions.length).toBe(3); 
        });
    
        it('should filter transactions by category', async () => {
            const res = await request(app)
                .get('/api/transactions?category=Food')
                .set('Cookie', [`accessToken=${authToken}`]);
    
            expect(res.statusCode).toBe(200);
            expect(res.body.transactions.length).toBe(2); // Expecting 1 transaction in the Food category
            expect(res.body.transactions[0].description).toBe('Transaction 2'); // Check the description
        });
    
        it('should paginate transactions', async () => {
            const res = await request(app)
                .get('/api/transactions?page=1&limit=2') // Requesting the first page with a limit of 2
                .set('Cookie', [`accessToken=${authToken}`]);
    
            expect(res.statusCode).toBe(200);
            expect(res.body.transactions.length).toBe(2); // Expecting 2 transactions on the first page
            expect(res.body.totalPages).toBe(2); // Expecting 2 total pages
            expect(res.body.currentPage).toBe(1); // Expecting current page to be 1
        });
    
        it('should return 500 on error', async () => {
            // Simulate an error by mocking the Transaction model
            jest.spyOn(Transaction, 'find').mockImplementationOnce(() => {
                throw new Error('Database error');
            });
    
            const res = await request(app)
                .get('/api/transactions')
                .set('Cookie', [`accessToken=${authToken}`]);
    
            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error retrieving transactions');
        });
    });

    // Test getting transactions in date range
    describe('POST /api/transactions/inRange', () => {
        it('should get transactions within date range', async () => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);

            const res = await request(app)
                .post('/api/transactions/inRange')
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                });

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(4);
        });
    });

    // Test updating a transaction
    describe('PUT /api/transactions/:id', () => {
        it('should update an existing transaction', async () => {
            const res = await request(app)
                .put(`/api/transactions/${testTransaction._id}`)
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    description: 'Updated Transaction',
                    amount: 150,
                    type: 'expense',
                    category: 'Food'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.description).toBe('Updated Transaction');
            expect(res.body.amount).toBe(150);
        });

        it('should fail to update non-existent transaction', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/transactions/${fakeId}`)
                .set('Cookie', [`accessToken=${authToken}`])
                .send({
                    description: 'Updated Transaction',
                    amount: 150,
                    type: 'expense',
                    category: 'Food'
                });

            expect(res.statusCode).toBe(404);
        });
    });

    // Test deleting a transaction
    describe('DELETE /api/transactions/:id', () => {
        it('should delete an existing transaction', async () => {
            const res = await request(app)
                .delete(`/api/transactions/${testTransaction._id}`)
                .set('Cookie', [`accessToken=${authToken}`]);

            expect(res.statusCode).toBe(200);

            // Verify transaction was deleted
            const deletedTransaction = await Transaction.findById(testTransaction._id);
            expect(deletedTransaction).toBeNull();
        });
    });
}); 