const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dating App API',
            version: '1.0.0',
            description: 'REST API for Dating Application',
            contact: {
                name: 'API Support',
                email: 'support@datingapp.com',
            },
        },
        servers: [
            {
                url: process.env.HOST_URL || `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                    description: 'API key for authorized apps',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        age: { type: 'integer', example: 25 },
                        location: { type: 'string', example: 'Mumbai, India' },
                        bio: { type: 'string', example: 'Love traveling and music' },
                        profilePicture: { type: 'string', example: '/uploads/profile-pictures/1-1708800000000.jpg' },
                        interests: { type: 'string', example: 'hiking,music,travel' },
                        lookingFor: { type: 'string', example: 'relationship' },
                        phoneNumber: { type: 'string', example: '9876543210' },
                        isVerified: { type: 'boolean', example: false },
                        otpVerified: { type: 'boolean', example: false },
                        accountStatus: {
                            type: 'string',
                            enum: ['active', 'suspended', 'deleted', 'pending_verification'],
                            example: 'pending_verification',
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateUser: {
                    type: 'object',
                    required: ['email', 'passwordHash', 'firstName', 'lastName', 'gender', 'age', 'location'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        passwordHash: { type: 'string', format: 'password', example: 'SecurePass123!' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        age: { type: 'integer', minimum: 18, maximum: 120, example: 25 },
                        location: { type: 'string', example: 'Mumbai, India' },
                        bio: { type: 'string', example: 'Love traveling and music' },
                        profilePicture: { type: 'string', example: 'https://example.com/photo.jpg' },
                        interests: { type: 'string', example: 'hiking,music,travel' },
                        lookingFor: { type: 'string', example: 'relationship' },
                        phoneNumber: { type: 'string', example: '9876543210' },
                    },
                },
                UpdateUser: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email', example: 'john.new@example.com' },
                        passwordHash: { type: 'string', format: 'password', example: 'NewPass456!' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Updated' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        age: { type: 'integer', minimum: 18, maximum: 120, example: 26 },
                        location: { type: 'string', example: 'Delhi, India' },
                        bio: { type: 'string', example: 'Updated bio' },
                        profilePicture: { type: 'string', example: 'https://example.com/new-photo.jpg' },
                        interests: { type: 'string', example: 'reading,cooking' },
                        lookingFor: { type: 'string', example: 'friendship' },
                        phoneNumber: { type: 'string', example: '9876543211' },
                    },
                },
                VerifyOtp: {
                    type: 'object',
                    required: ['otp'],
                    properties: {
                        otp: { type: 'string', example: '482917' },
                    },
                },
                Match: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 1 },
                        matchedUserId: { type: 'integer', example: 2 },
                        status: {
                            type: 'string',
                            enum: ['like', 'mutual_match', 'hidden', 'blocked'],
                            example: 'mutual_match',
                        },
                        matchedAt: { type: 'string', format: 'date-time' },
                        isNewMatch: { type: 'boolean', example: true },
                        hasUnreadMessages: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                MatchListItem: {
                    type: 'object',
                    properties: {
                        matchId: { type: 'integer', example: 1 },
                        matchedAt: { type: 'string', format: 'date-time' },
                        isNewMatch: { type: 'boolean', example: true },
                        hasUnreadMessages: { type: 'boolean', example: false },
                        lastMessage: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                messageId: { type: 'integer', example: 1 },
                                text: { type: 'string', example: 'Hey 👋 nice to match with you!' },
                                senderId: { type: 'integer', example: 2 },
                                sentAt: { type: 'string', format: 'date-time' },
                            },
                        },
                        user: {
                            type: 'object',
                            properties: {
                                userId: { type: 'integer', example: 2 },
                                firstName: { type: 'string', example: 'Jane' },
                                lastName: { type: 'string', example: 'Doe' },
                                age: { type: 'integer', example: 24 },
                                profilePicture: { type: 'string', example: '/uploads/profile-pictures/2-1708800000000.jpg' },
                                location: { type: 'string', example: 'Mumbai, India' },
                            },
                        },
                    },
                },
                Message: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        matchId: { type: 'integer', example: 1 },
                        senderId: { type: 'integer', example: 2 },
                        text: { type: 'string', example: 'Hey 👋 nice to match with you!' },
                        sentAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Something went wrong' },
                        errors: { type: 'object', nullable: true },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// Add global security to all endpoints
swaggerSpec.security = [
    { apiKeyAuth: [] },
];

module.exports = swaggerSpec;
