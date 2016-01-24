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

import Test from './api/test/test.model';
//import {mongo} from "mongoose";
Test.find({}).removeAsync()
    .then(() => {
        Test.create({
            name: 'Development Tools',
            info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
            'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
            'Stylus, Sass, and Less.'
        }, {
            name: 'Server and Client integration',
            info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
            'AngularJS, and Node.'
        }, {
            name: 'Smart Build System',
            info: 'Build system ignores `spec` files, allowing you to keep ' +
            'tests alongside code. Automatic injection of scripts and ' +
            'styles into your index.html'
        }, {
            name: 'Modular Structure',
            info: 'Best practice client and server structures allow for more ' +
            'code reusability and maximum scalability'
        }, {
            name: 'Optimized Build',
            info: 'Build process packs up your templates as a single JavaScript ' +
            'payload, minifies your scripts/css/images, and rewrites asset ' +
            'names for caching.'
        }, {
            name: 'Deployment Ready',
            info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
            'and openshift subgenerators'
        });
    });

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
