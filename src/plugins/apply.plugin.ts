import { TwitchBot } from '../bot';
import { signUp } from '../services/game.service';
import { IPayload } from '../interfaces';

export class ApplyPlugin {
  private applyForGame: number = -1;

  constructor(private bot: TwitchBot) {
    bot.addCommand('@applyFor', async (o:IPayload) => {
      const game: number = o.args[0] | -1;
      try {
        if (typeof(game) !== 'number' && game < 0)
          throw 'argument must be a number';
        this.applyForGame = game;
        return bot.say(`You can now play for game ${game}! Use !apply command`);
      } catch (e) {
        TwitchBot.sysLog
        ('error', 'Something went wrong with !applyFor', 'apply', {
          error: e,
        });
        return bot.whisper(o.user.username, 'Something went wrong with' +
          '!applyFor command');
      }
    });

    bot.addCommand('*apply', async (o:IPayload) => {
      if (this.applyForGame === -1) return bot.say('No !apply game set.');
      try {
        const game = this.applyForGame;
        await signUp(o.user.username, game);
        return bot.say(`${o.user.username} has signed up for game ${game}!`);
      } catch (e) {
        TwitchBot.sysLog('error', 'Problem applying for game', '~', {
          error: e,
          payload: o,
        });
        throw Error(e);
      }
    });
  }

}
