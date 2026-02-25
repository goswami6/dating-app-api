const apiResponse = require('../utils/apiResponse');

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return apiResponse.error(res, 'Access denied. API key is required.', 403);
    }

    // Validate against allowed API keys
    const validApiKeys = (process.env.API_KEYS || '').split(',').map(key => key.trim());

    if (!validApiKeys.includes(apiKey)) {
        return apiResponse.error(res, 'Access denied. Invalid API key.', 403);
    }

    next();
};

module.exports = apiKeyMiddleware;
