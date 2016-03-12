/**
 * Plugin Index.
 */
import betting from './betting';
import voting from './voting';

import * as userService from '../../services/user.service';
import {getChatters} from '../../services/twitch.service';
export default function (bot) {
  betting(bot);
  voting(bot);


  //Basic commands:
  bot.addCommand('*devbits', function(o) {
    userService.getDevbits(o.from, bits =>  bits ? bot.say(`${o.from}: ${bits} Devbits.`) : bot.say(`error connecting to database.`))
  });

  bot.addCommand('@whispertest', function(o) {
    bot.whisper(o.from, 'whisper test') //TODO: whispers are broken?
  });

  bot.addCommand('@spamwhisper', function(o) {
    for (let i = 0; i < 30; i++) {
      console.log('i ', i);
      bot.whisperQ(o.from, `Spam Whisper #${i}`)
    }
  });

  bot.addCommand('@chatters', function(o) {
    getChatters(chat => console.log('chat ', chat))
  });
}
