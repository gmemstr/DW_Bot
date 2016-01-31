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
}
