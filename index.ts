

// Set default node environment to development
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    //TODO: Insert jasmine tests here.
}

exports = module.exports = require('./server/app.js');
exports = module.exports = require('./server/irc.js');

