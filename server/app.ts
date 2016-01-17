import * as express from 'express';
import config from './config/environment';
import * as http from 'http';
import * as socket from 'socket.io';
import {Bot} from './bot/twitch-bot'

// Setup server
let app = express();
var server = http.createServer(app);

// Setup socketio
var socketio = socket(server, {
    serveClient: false,
    path: '/socket.io-client'
});

// Insert socket configs/routes

// Start server
function startServer() {
    console.log("config", config);
    app.dwBotServer = server.listen(config.port, config.ip, () => {
        console.log('Express server listening:', config.port, app.get('env'));
    })
}

// Start bot
function startBot() {
    app.twitchBot = new Bot(config.bot);
    app.twitchBot.run();
    //app.twitchBot.whisper('divine_don', 'test');
}

setImmediate(startServer);
setImmediate(startBot);

// Expose app
export default app;

