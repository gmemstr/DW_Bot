var util_1 = require('util');
var environment_1 = require('./config/environment');
var irc = require('tmi.js');
var Bot = (function () {
    function Bot(config) {
        this.client = new irc.client(config);
        this._config = config;
        this.commands = {};
    }
    Bot.prototype.chat = function (channel, user, message, bot, action) {
        if (message[0] == this._config.commandCharacter) {
            this.tryCommand(user.username, message);
        }
    };
    Bot.prototype.say = function (text, cb) {
        if (cb === void 0) { cb = function () { }; }
        this.client.say(this._config.channel, text);
        return cb();
    };
    Object.defineProperty(Bot.prototype, "Mods", {
        get: function () {
            return this.client.mods(this._config.channels[0]);
        },
        enumerable: true,
        configurable: true
    });
    Bot.prototype.isMod = function (name, cb) {
        this.Mods.then(function (res) {
            if (res.indexOf(name) !== -1) {
                return cb(true);
            }
            return cb(false);
        });
    };
    Bot.prototype.addCommand = function (command, callback) {
        if (typeof command === 'string') {
            var free = false;
            if (command[0] === '*') {
                command = command.slice(1);
                free = true;
                this.commands[command.toLowerCase()] = { command: command.toLowerCase(), ret: callback, free: free };
            }
            else if (command[0] === '@') {
                command = command.slice(1);
                this.commands[command.toLowerCase()] = { command: command.toLowerCase(), ret: callback, free: free };
            }
            else
                throw util_1.error('command does not have an Identifier. *, @, etc...');
        }
    };
    Bot.prototype.tryCommand = function (from, text, params) {
        if (params === void 0) { params = []; }
        if (text.length > this._config.commandCharacter.length && text[0] == this._config.commandCharacter) {
            var command = text.slice(this._config.commandCharacter.length).split(/\s+/g)[0].toLowerCase();
            var o = { from: from, text: text, rest: null, args: null, params: params };
            if (typeof command === 'string' && this.commands[command]) {
                o.rest = text.slice(command.length + 1).trim();
                o.args = o.rest.split(/\s+/g).map(function (x) { var t = +x; return isNaN(t) ? x : t; });
                var obj = this.commands[command];
                if (obj.free) {
                    this.doCommand(command, obj.ret, o);
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
    };
    return Bot;
})();
var test = new Bot(environment_1.default.bot);
test.addCommand('*hey', function (o) {
    console.log("got your command", o);
    test.say('got command yo', function () {
        console.log('got callback!');
    });
});
test.addCommand('*mods', function () {
    test.isMod('b3zman41', function (boolean) {
        console.log("is mod:", boolean);
    });
});
test.selfCommand('!hey something else bro');
test.run();
//# sourceMappingURL=irc.js.map