export default function(bot) {
    bot.addCommand('*bet', function () {
        bot.say('we got your bet.');
    });

    bot.addCommand('@modbet', function () {
        bot.say('we got your MOD bet');
    })
}