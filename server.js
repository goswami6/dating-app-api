const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./src/models');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerSpec = require('./src/config/swagger');
const routes = require('./src/routes');
const { initializeDatabase, syncDatabaseSchema } = require('./syncDatabase');
const { setupSocketHandlers } = require('./src/socket/callSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// Setup Socket.IO call signaling handlers
setupSocketHandlers(io);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Dating App API Docs',
}));

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Dating App API is running... Visit /api-docs for documentation.');
});

const PORT = process.env.PORT || 3000;
const HOST_URL = process.env.HOST_URL || `http://localhost:${PORT}`;

sequelize.authenticate()
    .then(async () => {
        console.log('Connected to MySQL Database');
        console.log('Syncing database schema...');

        await syncDatabaseSchema();

        console.log('Database schema synced.');

        server.listen(PORT, () => {
            console.log(`Server running at ${HOST_URL}`);
            console.log(`Swagger docs at ${HOST_URL}/api-docs`);
            console.log(`Socket.IO ready for calls`);
        });
    })
    .catch(async (err) => {
        console.error('MySQL connection error:', err.message);
        console.log('Attempting to create database and sync tables...');

        try {
            await initializeDatabase();
            console.log('Database initialized successfully. Starting server...');

            server.listen(PORT, () => {
                console.log(`Server running at ${HOST_URL}`);
                console.log(`Swagger docs at ${HOST_URL}/api-docs`);
                console.log(`Socket.IO ready for calls`);
            });
        } catch (syncErr) {
            console.error('Failed to initialize database:', syncErr.message);
            process.exit(1);
        }
    });
