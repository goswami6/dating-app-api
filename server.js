const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize } = require('./src/models');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerSpec = require('./src/config/swagger');
const routes = require('./src/routes');
const { initializeDatabase, syncDatabaseSchema } = require('./syncDatabase');

const app = express();

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

        app.listen(PORT, () => {
            console.log(`Server running at ${HOST_URL}`);
            console.log(`Swagger docs at ${HOST_URL}/api-docs`);
        });
    })
    .catch(async (err) => {
        console.error('MySQL connection error:', err.message);
        console.log('Attempting to create database and sync tables...');

        try {
            await initializeDatabase();
            console.log('Database initialized successfully. Starting server...');

            app.listen(PORT, () => {
                console.log(`Server running at ${HOST_URL}`);
                console.log(`Swagger docs at ${HOST_URL}/api-docs`);
            });
        } catch (syncErr) {
            console.error('Failed to initialize database:', syncErr.message);
            process.exit(1);
        }
    });
