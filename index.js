var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (env === 'development' || env === 'test') {
}
exports = module.exports = require('./server/app.js');
exports = module.exports = require('./server/irc.js');
//# sourceMappingURL=index.js.map