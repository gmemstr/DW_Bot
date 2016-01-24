'use strict';
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connectMongo = require('connect-mongo');
var mongoose = require('mongoose');
var environment_1 = require('./environment');
var mongoStorage = connectMongo(session);
function default_1(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(session({
        secret: environment_1.default.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new mongoStorage({
            mongooseConnection: mongoose.connection,
            db: 'dw-bot-server'
        })
    }));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=express.js.map