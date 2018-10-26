import { TwitchBot } from '../twitch.bot';
import { DPayload, IPayload } from '../interfaces';
import { channels, DiscordBot } from '../discord.bot';
import botUtils from '../common/bot.utils';

export class ApplyPlugin {
  private applyForGame: number = -1;

  constructor(private twitch: TwitchBot, private discord: DiscordBot) {
    twitch.addCommand('@applyFor', async (o:IPayload) => {
      const game: number = o.args[0] || -1;
      try {
        if (typeof(game) !== 'number' && game < 0)
          throw 'argument must be a number';
        this.applyForGame = game;
        discord.say(`users can now type !apply to apply for game ID: ${game}`,
          channels.bot_testing);
        return twitch
          .say(`You can now play for game ${game}! Use !apply command`);
      } catch (e) {
        botUtils.sysLog
        ('error', 'Something went wrong with !applyFor', 'apply', {
          error: e,
        });
        return twitch.whisper(o.user.username, 'Something went wrong with' +
          '!applyFor command');
      }
    });

    discord.addCommand('D*apply', async (o:DPayload) => {
      const username = o.user.username;
      console.log(`username`);
      console.log(username);
      // check to see if this discord user has devwars account.

    });

    // bot.addCommand('*apply', async (o:IPayload) => {
    //   if (this.applyForGame === -1) return bot.say('No !apply game set.');
    //   try {
    //     const game = this.applyForGame;
    //     await signUp(o.user.username, game);
    //     return bot.say(`${o.user.username} has signed up for game ${game}!`);
    //   } catch (e) {
    //     TwitchBot.sysLog('error', 'Problem applying for game', '~', {
    //       error: e,
    //       payload: o,
    //     });
    //     throw Error(e);
    //   }
    // });
  }

}
