

// Set default node environment to development
const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    //TODO: Insert jasmine tests here.
}

exports = module.exports = require('./server/app.js');

