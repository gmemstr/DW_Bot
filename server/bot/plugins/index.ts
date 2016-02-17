/**
 * Plugin Index.
 */
import betting from './betting';
import * as userService from '../../services/user.service';
export default function (bot) {
  betting(bot);

  //Basic commands:
  bot.addCommand('*devbits', function(o) {
    userService.getDevbits(o.from, bits => bot.say(`${o.from}: ${bits} Devbits.`))
  });

  bot.addCommand('@whispertest', function(o) {
    bot.whisper(o.from, 'whisper test') //TODO: whispers are broken?
  });

  bot.addCommand('@spamwhisper', function(o) {
    for (let i = 0; i < 30; i++) {
      console.log('i ', i);
      bot.whisperQ(o.from, `Spam Whisper #${i}`)
    }


  })
}
