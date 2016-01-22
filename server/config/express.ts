'use strict';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as connectMongo from 'connect-mongo';
import * as mongoose from 'mongoose';
import config from './environment';

var mongoStorage = connectMongo(session);

export default function(app) {
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(bodyParser.json());
    app.use(methodOverride);
    app.use(cookieParser);


    app.use(session({
        secret: config.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new mongoStorage({
            mongooseConnection: mongoose.connection,
            db: 'dw-bot-server'
        })
    }))

}
