import {error} from "util";
var irc = require('tmi.js');
var options = {
    options: {
        debug: true,
    },
    connection: {
        random: 'chat',
        reconnect: true
    },
    identity: {
        username: 'DDon_Bot',
        password: 'oauth:1232d9a4ox2b00fzcmygg40xn1m7r5'
    },
    channels: ['#Divine_Don'],
    bot: {
        commandCharacter: '!'
    }
};

class bot {
    irc: any;
    _config: any;
    commands: Object;
    client: any;
    commandChar: string;

    constructor(config) {
        this.client = new irc.client(config);
        this.client.connect();
        this.client.addListener('chat', this.chat.bind(this));
        this._config = config;
        this.commands = {};
        this.commandChar = '!';
    }

    chat(channel, user, message, bot, action) {
        this.commandChar = options.bot.commandCharacter;
        console.log("ircUser", user);
        console.log(`
            channel: ${channel}
            message: ${message}
            bot: ${bot}
            action: ${action}
        `);
        if (message[0] == this.commandChar) {
            this.tryCommand(user.username, message)
        }
    }

    say(text: String, cb: Function=() => {}) {
        this.client.say(this._config.channels[0], text);
        return cb();
    }

    get Mods() {
        return this.client.mods(this._config.channels[0]);
    }
    
    isMod(name: String, cb: Function) {
        this.Mods.then((res) => {
            console.log("res", res);
            console.log("res.indexOf(name)", res.indexOf(name));
            //return cb(res.indexOf(name) ? true : false);
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
            else if (command[0] === '%') { //Only mods can use
                command = command.slice(1);
                this.commands[command.toLowerCase()] = {command: command.toLowerCase(), ret: callback, free: free}
            }
            else throw error('command does not have an Identifier. *, %, etc...');
        }
    }

    tryCommand(from, text, params=[]) {
        console.log(this.commandChar);
        if (text.length > this.commandChar.length && text[0] == this.commandChar) {
            let command = text.slice(this.commandChar.length).split(/\s+/g)[0].toLowerCase();
            let o = {from: from, text: text, rest: null, args: null, params: params};
            console.log("command:", command);
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
    
}

//var client = new irc.client(options);
var test = new bot(options);
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

