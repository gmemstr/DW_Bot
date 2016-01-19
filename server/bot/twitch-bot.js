var util_1 = require('util');
var irc = require('tmi.js');
var Bot = (function () {
    function Bot(config) {
        if (config === void 0) { config = {}; }
        this.client = new irc.client(config);
        this._config = config;
        this.commands = {};
        this.userGroups = ['*', '$', '@'];
    }
    Bot.prototype.chat = function (channel, user, message, bot, action) {
        if (message[0] === this._config.commandCharacter) {
            this.tryCommand(user.username, message);
        }
    };
    Bot.prototype.whisper = function (from, message) {
        if (message[0] === this._config.commandCharacter) {
            this.tryCommand(from, message);
        }
    };
    Bot.prototype.say = function (text, cb) {
        if (cb === void 0) { cb = function () { }; }
        this.client.say(this._config.channels[0], text);
        return cb();
    };
    Bot.connectWhisper = function (config) {
        new irc.client(config);
    };
    Object.defineProperty(Bot.prototype, "Mods", {
        get: function () {
            return this.client.mods(this._config.channels[0]);
        },
        enumerable: true,
        configurable: true
    });
    Bot.prototype.isMod = function (name, cb) {
        if (name === this._config.channels[0].slice(1))
            return cb(true);
        this.Mods.then(function (res) {
            console.log("res", res);
            if (res.indexOf(name) !== -1) {
                return cb(true);
            }
            return cb(false);
        });
    };
    Bot.prototype.addCommand = function (command, response) {
        console.log("adding command:", command);
        if (typeof command === 'string') {
            if (command[0] === '*' || command[0] === '$' || command[0] === '@') {
                this.commands[command.slice(1).toLowerCase()] = { command: command.slice(1).toLowerCase(), response: response, rights: this.userGroups.indexOf(command[0]) };
            }
            else
                throw util_1.error('command does not have an Identifier. *, $, or @!');
        }
    };
    Bot.prototype.tryCommand = function (from, text, params) {
        var _this = this;
        if (params === void 0) { params = []; }
        console.log("from", from);
        if (text.length > this._config.commandCharacter.length && text[0] == this._config.commandCharacter) {
            var command = text.slice(this._config.commandCharacter.length).split(/\s+/g)[0].toLowerCase();
            var o = { from: from, text: text, rest: null, args: null, params: params };
            if (typeof command === 'string' && this.commands[command]) {
                o.rest = text.slice(command.length + 1).trim();
                o.args = o.rest.split(/\s+/g).map(function (x) { var t = +x; return isNaN(t) ? x : t; });
                var obj = this.commands[command];
                console.log("obj", obj);
                if (obj.rights === 0) {
                    this.doCommand(command, obj.response, o);
                }
                else if (obj.rights === 2) {
                    this.isMod(from, function (res) { if (res)
                        _this.doCommand(command, obj.response, o); });
                }
            }
        }
    };
    Bot.prototype.doCommand = function (command, callback, o) {
        if (typeof command === 'string' && typeof callback === 'function') {
            callback.call(this, o);
        }
    };
    Bot.prototype.selfCommand = function (text) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return this.tryCommand(this._config.identity.username, text, params);
    };
    Object.defineProperty(Bot.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (newConfig) {
            this._config = newConfig;
        },
        enumerable: true,
        configurable: true
    });
    Bot.prototype.run = function () {
        this.client.connect();
        this.client.addListener('chat', this.chat.bind(this));
        var whisperConfig = this._config;
        whisperConfig.connection = {
            server: 'group.tmi.twitch.tv',
            port: 80,
            reconnect: true
        };
        var whisperBot = new irc.client(whisperConfig);
        whisperBot.connect();
        whisperBot.addListener('whisper', this.whisper.bind(this));
    };
    return Bot;
})();
exports.Bot = Bot;
//# sourceMappingURL=twitch-bot.js.map