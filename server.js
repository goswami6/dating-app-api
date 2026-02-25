const express = require('express');
const dotenv = require('dotenv');

// Load env vars first
dotenv.config();

const { sequelize } = require('./src/models');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// Initialize App
const app = express();

const path = require('path');

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Dating App API Docs',
}));

// Serve swagger JSON
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Routes
const routes = require('./src/routes');
const apiKeyMiddleware = require('./src/middleware/apiKeyMiddleware');
app.use('/api', apiKeyMiddleware, routes);

app.get('/', (req, res) => {
  res.send('Dating App API is running... Visit /api-docs for documentation.');
});

// Start Server
const PORT = process.env.PORT || 3000;
const HOST_URL = process.env.HOST_URL || `http://localhost:${PORT}`;

const initializeDatabase = require('./syncDatabase');

sequelize.authenticate()
    .then(() => {
        console.log('✅ Connected to MySQL Database');
        app.listen(PORT, () => {
            console.log(`🚀 Server running at ${HOST_URL}`);
            console.log(`📚 Swagger docs at ${HOST_URL}/api-docs`);
        });
    })
    .catch(async (err) => {
        console.error('❌ MySQL connection error:', err.message);
        console.log('🔄 Attempting to create database and sync tables...');
        try {
            await initializeDatabase();
            console.log('✅ Database initialized successfully. Starting server...');
            app.listen(PORT, () => {
                console.log(`🚀 Server running at ${HOST_URL}`);
                console.log(`📚 Swagger docs at ${HOST_URL}/api-docs`);
            });
        } catch (syncErr) {
            console.error('❌ Failed to initialize database:', syncErr.message);
            process.exit(1);
        }
    });
