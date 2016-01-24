function default_1(bot) {
    bot.addCommand('*bet', function () {
        bot.say('we got your bet.');
    });
    bot.addCommand('@modbet', function () {
        bot.say('we got your MOD bet');
    });
    bot.addCommand('@testapi', function () {
        var obj = {
            name: 'don',
            number: 1,
            active: true
        };
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=betting.js.map