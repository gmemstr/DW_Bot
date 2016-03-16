import * as express from 'express';
import * as mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import * as http from 'http';
import * as socket from 'socket.io';
import {Bot} from './bot/twitch-bot';
import Plugins from './bot/plugins';
import expressInit from './config/express';
import routesInit from './routes';
import * as Firebase from 'firebase';


// Setup server
const app = express();
const server = http.createServer(app);
const socketio = socket(server, {
  serveClient: false,
  path: '/socket.io-client'
});
expressInit(app);
routesInit(app);

// Start mongodb
function dbInit() {
  mongoose.connect(config.mongo.uri, config.mongo.options);
  mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  });
}

// Start server
function serverInit() {
  app.dwBotServer = server.listen(config.port, config.ip, () => {
    console.log('Express server listening:', config.port, app.get('env'));
  })
}

// Start bot
function botInit() {
  console.log("config.bot", config.bot);
  app.twitchBot = new Bot(config.bot);
  app.twitchBot.run();
  Plugins(app.twitchBot);
}


// Firebase handshake
function fbInit() {
  const {url, key} = config.firebase;
  const ref = new Firebase(url);
  ref.authWithCustomToken(key, (error, authData) => {
    error ? console.log('Firebase FAILED to connect') : console.log('Firebase Connected!', authData);
  })
}

setImmediate(dbInit);
setImmediate(serverInit);
setImmediate(botInit);
setImmediate(fbInit);

// Expose app
export default app;
