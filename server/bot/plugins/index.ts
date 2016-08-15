/**
 * Plugin Index.
 */
import Betting from './betting.plugin';
import Voting from './voting';
import frame from './frame';
import * as userService from '../../services/user.service';
import {getChatters} from '../../services/twitch.service';
import {api} from "../../services/game.service";
import {create} from '../../api/test/test.controller';
import {resetFrame} from '../../services/firebase.service'

export default function (bot) {
  new Betting(bot);
  new Voting(bot);
  frame(bot);


  //Basic commands:
  bot.addCommand('*devbits', function(o) {
    userService.getDevbits(o.from, bits =>
      bits ? bot.say(`${o.from}: ${bits} Devbits.`) : bot.say(`error connecting to database.`))
  });

  bot.addCommand('@whispertest', function(o) {
    bot.whisper(o.from, 'whisper test');
  });

  bot.addCommand('@spamwhisper', function(o) {
    for (let i = 0; i < 30; i++) {
      console.log('i ', i);
      bot.whisperQ(o.from, `Spam Whisper #${i}`)
    }
  });
  
  bot.addCommand('@resetfirebase', (o) => resetFrame());

  bot.addCommand('@chatters', function(o) {
    getChatters(chat => console.log('chat ', chat))
  });

  bot.addCommand('@create', o => create({name: 'Hey', info: 'A Dude', active: true, something: false}, res => console.log("res", res)))
}
