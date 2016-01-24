import * as express from 'express';
import * as mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import * as http from 'http';
import * as socket from 'socket.io';
import {Bot} from './bot/twitch-bot';
import Plugins from './bot/plugins';
import expresInit from './config/express';
import routesInit from './routes';

mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = socket(server, {
    serveClient: false,
    path: '/socket.io-client'
});
expresInit(app);
routesInit(app);


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
