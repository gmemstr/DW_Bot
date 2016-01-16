import {error} from 'util';
import conf from './config/environment';
var irc = require('tmi.js');
//var options = {
//    options: {
//        debug: true,
//    },
//    connection: {
//        random: 'chat',
//        reconnect: true
//    },
//    identity: {
//        username: 'DDon_Bot',
//        password: 'oauth:1232d9a4ox2b00fzcmygg40xn1m7r5'
//    },
//    channels: ['#Divine_Don'],
//    bot: {
//        commandCharacteracter: '!'
//    }
//};

class Bot {
    irc: any;
    _config: any;
    commands: Object;
    client: any;
    commandCharacter: string;

    constructor(config) {
        this.client = new irc.client(config);
        this._config = config;
        this.commands = {};
    }

    chat(channel, user, message, bot, action) {
        if (message[0] == this._config.commandCharacter) {
            this.tryCommand(user.username, message)
        }
    }

    say(text: String, cb: Function=() => {}) {
        this.client.say(this._config.channel, text);
        return cb();
    }

    get Mods() {
        return this.client.mods(this._config.channels[0]);
    }
    
    isMod(name: String, cb: Function) {
        this.Mods.then((res) => {
            if (res.indexOf(name) !== -1) {
                return cb(true);
            }
            return cb(false);
        });

    }

    addCommand(command, callback) {
        if (typeof command === 'string') {
            let free = false;
            if (command[0] === '*') { //Everyone can use.
                command = command.slice(1);
                free = true;
                this.commands[command.toLowerCase()] = {command: command.toLowerCase(), ret: callback, free: free};
            }
            //TODO: add $ for subscriptions.
            else if (command[0] === '@') { //Only mods can use
                command = command.slice(1);
                this.commands[command.toLowerCase()] = {command: command.toLowerCase(), ret: callback, free: free}
            }
            else throw error('command does not have an Identifier. *, @, etc...');
        }
    }

    tryCommand(from, text, params=[]) {
        if (text.length > this._config.commandCharacter.length && text[0] == this._config.commandCharacter) {
            let command = text.slice(this._config.commandCharacter.length).split(/\s+/g)[0].toLowerCase();
            let o = {from: from, text: text, rest: null, args: null, params: params};

            if (typeof command === 'string' && this.commands[command]) {
                o.rest = text.slice(command.length+1).trim();
                o.args = o.rest.split(/\s+/g).map(function(x) {var t = +x; return isNaN(t)? x: t});
                let obj = this.commands[command];
                if (obj.free) {//TODO: add mod if statement later.
                    this.doCommand(command, obj.ret, o)
                }
            }
        }
    }

    doCommand(command, callback, o) {
        if (typeof command === 'string' && typeof callback === 'function') {
            callback.call(this, o);
        }
    }

    selfCommand(text, ...params) { //this only used for the bot to tell itself to do a command.
        return this.tryCommand(this._config.identity.username, text, params);
    }

    get config() {
        return this._config;
    }

    set config(newConfig) {
        this._config = newConfig
    }

    run() {
        this.client.connect();
        this.client.addListener('chat', this.chat.bind(this));
    }
    
}

//var client = new irc.client(options);
var test = new Bot(conf.bot);
test.addCommand('*hey', function (o) {
    console.log("got your command", o);
    test.say('got command yo', () => {
        console.log('got callback!');
    });
});

test.addCommand('*mods', function () {
    test.isMod('b3zman41', boolean => {
        console.log("is mod:", boolean);
    })
});

test.selfCommand('!hey something else bro');

test.run();

