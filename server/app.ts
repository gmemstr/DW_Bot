import * as express from 'express';
import config from './config/environment';
import * as http from 'http';
import * as socket from 'socket.io';
import {Bot} from './bot/twitch-bot';
import Plugins from './bot/plugins';
import expresInit from './config/express';

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = socket(server, {
    serveClient: false,
    path: '/socket.io-client'
});
expresInit(app);

// Insert socket configs/routes

// Start server
function startServer() {
    app.dwBotServer = server.listen(config.port, config.ip, () => {
        console.log('Express server listening:', config.port, app.get('env'));
    })
}

// Start bot
function startBot() {
    app.twitchBot = new Bot(config.bot);
    app.twitchBot.run();
    Plugins(app.twitchBot);
}

setImmediate(startServer);
setImmediate(startBot);

// Expose app
export default app;
