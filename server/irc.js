var util_1 = require("util");
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
var bot = (function () {
    function bot(config) {
        this.client = new irc.client(config);
        this.client.connect();
        this.client.addListener('chat', this.chat.bind(this));
        this._config = config;
        this.commands = {};
        this.commandChar = '!';
    }
    bot.prototype.chat = function (channel, user, message, bot, action) {
        this.commandChar = options.bot.commandCharacter;
        console.log("ircUser", user);
        console.log("\n            channel: " + channel + "\n            message: " + message + "\n            bot: " + bot + "\n            action: " + action + "\n        ");
        if (message[0] == this.commandChar) {
            this.tryCommand(user.username, message);
        }
    };
    bot.prototype.say = function (text, cb) {
        if (cb === void 0) { cb = function () { }; }
        this.client.say(this._config.channels[0], text);
        return cb();
    };
    Object.defineProperty(bot.prototype, "Mods", {
        get: function () {
            return this.client.mods(this._config.channels[0]);
        },
        enumerable: true,
        configurable: true
    });
    bot.prototype.isMod = function (name, cb) {
        this.Mods.then(function (res) {
            console.log("res", res);
            console.log("res.indexOf(name)", res.indexOf(name));
            if (res.indexOf(name) !== -1) {
                return cb(true);
            }
            return cb(false);
        });
    };
    bot.prototype.addCommand = function (command, callback) {
        if (typeof command === 'string') {
            var free = false;
            if (command[0] === '*') {
                command = command.slice(1);
                free = true;
                this.commands[command.toLowerCase()] = { command: command.toLowerCase(), ret: callback, free: free };
            }
            else if (command[0] === '%') {
                command = command.slice(1);
                this.commands[command.toLowerCase()] = { command: command.toLowerCase(), ret: callback, free: free };
            }
            else
                throw util_1.error('command does not have an Identifier. *, %, etc...');
        }
    };
    bot.prototype.tryCommand = function (from, text, params) {
        if (params === void 0) { params = []; }
        console.log(this.commandChar);
        if (text.length > this.commandChar.length && text[0] == this.commandChar) {
            var command = text.slice(this.commandChar.length).split(/\s+/g)[0].toLowerCase();
            var o = { from: from, text: text, rest: null, args: null, params: params };
            console.log("command:", command);
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
    bot.prototype.doCommand = function (command, callback, o) {
        if (typeof command === 'string' && typeof callback === 'function') {
            callback.call(this, o);
        }
    };
    bot.prototype.selfCommand = function (text) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return this.tryCommand(this._config.identity.username, text, params);
    };
    Object.defineProperty(bot.prototype, "config", {
        get: function () {
            return this._config;
        },
        set: function (newConfig) {
            this._config = newConfig;
        },
        enumerable: true,
        configurable: true
    });
    return bot;
})();
var test = new bot(options);
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
//# sourceMappingURL=irc.js.map