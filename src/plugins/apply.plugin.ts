import { TwitchBot } from '../bot';
import { currentGame, signUp } from '../services/game.service';
import { IPayload } from '../interfaces';

export class ApplyPlugin {
  private applyForGame: number = -1;

  constructor(private bot: TwitchBot) {
    bot.addCommand('@applyFor', async (o:IPayload) => {
      try {
        const game = await currentGame();
        if (game.id <= 0) throw `applyFor can't open up for Game(${game.id})`;
        return this.applyForGame = game.id;
      } catch (e) {
        bot.sysLog('error', 'Something went wrong with !applyFor', 'apply', {
          error: e,
        });
        return bot.whisper(o.user.username, 'Something went wrong with' +
          '!applyFor command');
      }
    });

    bot.addCommand('*apply', async (o:IPayload) => {
      try {
        const game = await currentGame();
        const { id } = game;
        await signUp(o.user.username, id);
        return bot.say(`${o.user.username} has signed up for game ${id}!`);
      } catch (e) {
        bot.sysLog('error', 'Problem applying for game', '~', {
          error: e,
          payload: o,
        });
        throw Error(e);
      }
    });
  }

}
