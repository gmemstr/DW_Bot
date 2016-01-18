import {error} from 'util';
var irc = require('tmi.js');

export class Bot {
    client: any;
    whisperClient: any;
    _config: any;
    commands: Object;

    constructor(config={}) {
        this.client = new irc.client(config);
        this._config = config;
        this.commands = {};

        //whisper connection
        //let whisperConfig = this._config;
        //whisperConfig.connection = {
        //    server: 'group.tmi.twitch.tv',
        //    port: 80,
        //    reconnect: true
        //};
        //console.log("whisperConfig", whisperConfig);
        //this.whisperClient = new irc.client(whisperConfig);
    }

    chat(channel, user, message, bot, action) {
        if (message[0] === this._config.commandCharacter) {
            this.tryCommand(user.username, message)
        }
    }

    whisper(from, message) {
        if (message[0] === this._config.commandCharacter) {
            this.tryCommand(from, message)
        }
    }

    say(text: String, cb: Function=() => {}) {
        this.client.say(this._config.channels[0], text);
        return cb();
    }

    static connectWhisper(config) {
        new irc.client(config);
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

    addCommand(command: String, callback: Function) {
        console.log("adding command:", command);
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

    tryCommand(from: String, text: String, params: any=[]) {
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

    doCommand(command: String, callback: Function, o: Object) {
        if (typeof command === 'string' && typeof callback === 'function') {
            callback.call(this, o);
        }
    }

    selfCommand(text: String, ...params) { //this only used for the bot to tell itself to do a command.
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

        // Connect whisper server
        let whisperConfig = this._config;
        whisperConfig.connection = {
            server: 'group.tmi.twitch.tv',
            port: 80,
            reconnect: true
        };
        var whisperBot = new irc.client(whisperConfig);
        whisperBot.connect();
        whisperBot.addListener('whisper', this.whisper.bind(this));

    }
}

