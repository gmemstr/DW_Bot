var express = require('express');
var environment_1 = require('./config/environment');
var http = require('http');
var socket = require('socket.io');
var twitch_bot_1 = require('./bot/twitch-bot');
var app = express();
var server = http.createServer(app);
var socketio = socket(server, {
    serveClient: false,
    path: '/socket.io-client'
});
function startServer() {
    console.log("config", environment_1.default);
    app.dwBotServer = server.listen(environment_1.default.port, environment_1.default.ip, function () {
        console.log('Express server listening:', environment_1.default.port, app.get('env'));
    });
}
function startBot() {
    app.twitchBot = new twitch_bot_1.Bot(environment_1.default.bot);
    app.twitchBot.run();
}
setImmediate(startServer);
setImmediate(startBot);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;
//# sourceMappingURL=app.js.map