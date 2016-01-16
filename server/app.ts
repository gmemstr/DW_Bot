import * as express from 'express';
import config from './config/environment';
import * as http from 'http';
import * as socket from 'socket.io';

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

setImmediate(startServer);

// Expose app
export default app;

