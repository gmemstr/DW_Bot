var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (env === 'development' || env === 'test') {
}
exports = module.exports = require('./server/app.js');
//# sourceMappingURL=index.js.map