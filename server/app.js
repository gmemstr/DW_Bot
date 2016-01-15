var express = require('express');
var environment_1 = require('./config/environment');
var http = require('http');
var socket = require('socket.io');
var app = express();
var server = http.createServer(app);
var socketio = socket(server, {
    serveClient: false,
    path: '/socket.io-client'
});
function startServer() {
    app.dwBotServer = server.listen(environment_1.default.port, environment_1.default.ip, function () {
        console.log('Express server listening:', environment_1.default.port, app.get('env'));
    });
}
setImmediate(startServer);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;
//# sourceMappingURL=app.js.map