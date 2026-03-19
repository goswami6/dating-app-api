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
                SubscriptionPlan: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Gold' },
                        duration: { type: 'integer', example: 30 },
                        price: { type: 'number', example: 499.0 },
                        currency: { type: 'string', example: 'INR' },
                        features: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['unlimited_likes', 'see_who_likes_you']
                        },
                        isActive: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        age: { type: 'integer', example: 26 },
                        location: { type: 'string', example: 'Delhi' },
                        bio: { type: 'string', example: 'Hello world' },
                        profilePicture: { type: 'string', example: '/uploads/gallery/1-1708800000000.jpg' },
                        interests: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['reading', 'travel'],
                        },
                        lookingFor: { type: 'string', example: 'relationship' },
                        occupation: { type: 'string', example: 'Engineer' },
                        education: { type: 'string', example: 'B.Tech' },
                        matchesCount: { type: 'integer', example: 100 },
                        likesCount: { type: 'integer', example: 12 },
                        boostsCount: { type: 'integer', example: 3 },
                        isPremium: { type: 'boolean', example: true },
                        preferences: {
                            type: 'object',
                            example: { smoking: false, drinking: true },
                        },
                        phoneNumber: { type: 'string', example: '9876543210' },
                        isVerified: { type: 'boolean', example: false },
                        otpVerified: { type: 'boolean', example: false },
                        accountStatus: {
                            type: 'string',
                            enum: ['active', 'suspended', 'deleted', 'pending_verification'],
                            example: 'active',
                        },
                        Photos: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UserPhoto' },
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
                        age: { type: 'integer', minimum: 18, maximum: 120, example: 26 },
                        location: { type: 'string', example: 'Delhi' },
                        bio: { type: 'string', example: 'Hello world' },
                        profilePicture: { type: 'string', example: 'https://example.com/photo.jpg' },
                        interests: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['reading', 'travel'],
                        },
                        lookingFor: { type: 'string', example: 'relationship' },
                        occupation: { type: 'string', example: 'Engineer' },
                        education: { type: 'string', example: 'B.Tech' },
                        isPremium: { type: 'boolean', example: false },
                        preferences: {
                            type: 'object',
                            example: { smoking: false, drinking: true },
                        },
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
                        location: { type: 'string', example: 'Delhi' },
                        bio: { type: 'string', example: 'Updated bio' },
                        profilePicture: { type: 'string', example: 'https://example.com/new-photo.jpg' },
                        interests: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['reading', 'cooking'],
                        },
                        lookingFor: { type: 'string', example: 'friendship' },
                        occupation: { type: 'string', example: 'Designer' },
                        education: { type: 'string', example: 'M.Tech' },
                        isPremium: { type: 'boolean', example: true },
                        preferences: {
                            type: 'object',
                            example: { smoking: false, drinking: false },
                        },
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
                            enum: ['like', 'super_like', 'mutual_match', 'hidden', 'blocked'],
                            example: 'mutual_match',
                        },
                        isSuperLike: { type: 'boolean', example: false },
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
                        isSuperLike: { type: 'boolean', example: false },
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
                                images: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['/uploads/gallery/2-photo1.jpg', '/uploads/gallery/2-photo2.jpg'],
                                },
                                location: { type: 'string', example: 'Mumbai, India' },
                                bio: { type: 'string', example: 'Love hiking and coffee' },
                                interests: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['travel', 'music'],
                                },
                                isOnline: { type: 'boolean', example: true },
                                occupation: { type: 'string', example: 'Designer' },
                                education: { type: 'string', example: 'B.Des' },
                                badges: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'integer', example: 1 },
                                            name: { type: 'string', example: 'Early Bird' },
                                            icon: { type: 'string', example: '🐦' },
                                            color: { type: 'string', example: '#FFD700' },
                                            isPremium: { type: 'boolean', example: false },
                                        },
                                    },
                                },
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
                UserPhoto: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 101 },
                        userId: { type: 'integer', example: 1 },
                        url: { type: 'string', example: '/uploads/gallery/1-1708800000000.jpg' },
                        isPrimary: { type: 'boolean', example: true },
                        caption: { type: 'string', nullable: true, example: 'My vacation photo' },
                        sortOrder: { type: 'integer', example: 0 },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Badge: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Early Bird' },
                        icon: { type: 'string', example: '🐦' },
                        description: { type: 'string', example: 'Joined within the first month' },
                        requiredMonth: { type: 'integer', example: 1 },
                        color: { type: 'string', example: '#FFD700' },
                        isPremium: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                MatchCriteria: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 1 },
                        minAge: { type: 'integer', example: 18 },
                        maxAge: { type: 'integer', example: 50 },
                        maxDistance: { type: 'number', format: 'float', example: 50.0, description: 'Max distance in km' },
                        interests: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['travel', 'music', 'fitness'],
                        },
                        gender: {
                            type: 'string',
                            enum: ['male', 'female', 'other', 'all'],
                            example: 'all',
                        },
                        onlineOnly: { type: 'boolean', example: false },
                        incognitoMode: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                TopPickItem: {
                    type: 'object',
                    properties: {
                        topPickId: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Sarah' },
                        age: { type: 'integer', example: 25 },
                        image: { type: 'string', example: '/uploads/gallery/3-photo1.jpg' },
                        isOnline: { type: 'boolean', example: true },
                        timeLeft: { type: 'string', example: '12h 30m' },
                        expiresAt: { type: 'string', format: 'date-time' },
                    },
                },
                Call: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        matchId: { type: 'integer', example: 12 },
                        callerId: { type: 'integer', example: 3 },
                        receiverId: { type: 'integer', example: 5 },
                        callType: { type: 'string', enum: ['voice', 'video'], example: 'video' },
                        status: {
                            type: 'string',
                            enum: ['ringing', 'ongoing', 'ended', 'missed', 'rejected', 'busy'],
                            example: 'ended',
                        },
                        startedAt: { type: 'string', format: 'date-time' },
                        endedAt: { type: 'string', format: 'date-time' },
                        duration: { type: 'integer', example: 120, description: 'Duration in seconds' },
                        endReason: {
                            type: 'string',
                            enum: ['completed', 'caller_cancelled', 'receiver_rejected', 'receiver_busy', 'no_answer', 'network_error'],
                            example: 'completed',
                        },
                        Caller: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                profilePicture: { type: 'string' },
                            },
                        },
                        Receiver: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                profilePicture: { type: 'string' },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
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
