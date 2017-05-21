"use strict";
exports.__esModule = true;
var TwitchBot = (function () {
    function TwitchBot(config) {
        this.config = config;
        console.log(this.greet());
    }
    TwitchBot.prototype.greet = function () {
        return console.log(this.config);
    };
    return TwitchBot;
}());
exports.TwitchBot = TwitchBot;
