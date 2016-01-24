var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var environment_1 = require('./config/environment');
var http = require('http');
var socket = require('socket.io');
var twitch_bot_1 = require('./bot/twitch-bot');
var plugins_1 = require('./bot/plugins');
var express_1 = require('./config/express');
var routes_1 = require('./routes');
mongoose.connect(environment_1.default.mongo.uri, environment_1.default.mongo.options);
mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
});
var app = express();
var server = http.createServer(app);
var socketio = socket(server, {
    serveClient: false,
    path: '/socket.io-client'
});
express_1.default(app);
routes_1.default(app);
var test_model_1 = require('./api/test/test.model');
test_model_1.default.find({}).removeAsync()
    .then(function () {
    test_model_1.default.create({
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
function startServer() {
    app.dwBotServer = server.listen(environment_1.default.port, environment_1.default.ip, function () {
        console.log('Express server listening:', environment_1.default.port, app.get('env'));
    });
}
function startBot() {
    app.twitchBot = new twitch_bot_1.Bot(environment_1.default.bot);
    app.twitchBot.run();
    plugins_1.default(app.twitchBot);
}
setImmediate(startServer);
setImmediate(startBot);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;
//# sourceMappingURL=app.js.map