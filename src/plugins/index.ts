import { IPayload } from '../interfaces';
import {  TwitchBot } from '../bot';
import { BettingPlugin } from './betting.plugin';
import { getBits } from '../services/user.service';
import {
  addTime, resetFrame, startTimer, switchStage,
  updateFrame,
} from '../services/firebase.service';
import { getStreamInfo } from '../services/twitch.service';
import { currentGame, signUp } from '../services/game.service';
import { BPMPlugin } from './bpm.plugin';
import { VotingPlugin } from './voting.plugin';

const plugins = (bot: TwitchBot) => {
  new BettingPlugin(bot);
  new BPMPlugin(bot);
  new VotingPlugin(bot);

  bot.addCommand('@startgame', async (o:IPayload) => {
    try {
      const game = await currentGame();
      await Promise
        .all([switchStage('objective'), updateFrame({ game }), startTimer()]);

      await bot.say('Starting Game!');

      if (game.theme.toLowerCase() === 'zen garden') {
        await bot.say('bets are closed for this game.');
      } else {
        await bot.say('betting will open in 5 minutes.');
        setTimeout(() => bot.selfCommand('!openbets'), 300000);
      }

    } catch (e) {
      bot.sysLog('error', 'Problems with startGame command', '~', e);
    }
  });

  bot.addCommand('*devbits', async (o:IPayload) => {
    const bits = await getBits(o.user.username);
    return bot.say(`${o.user.username}: ${bits}`);
  });

  bot.addCommand('*bits', async (o:IPayload) => {
    const bits = await getBits(o.user.username);
    return bot.say(`${o.user.username}: ${bits}`);
  });

  bot.addCommand('@stage', async (o:IPayload) => {
    const stage = o.args[0] || 'objective';
    return switchStage(stage);
  });

  bot.addCommand('@addtime', async (o:IPayload) => {
    // user input will be in minute format. So !addtime 1 should add 1m.
    const ms = Math.floor(o.args[0] * 60 * 1000);
    return addTime(ms);
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

  bot.addCommand('@channel', async (o:IPayload) => {
    return getStreamInfo('beleek');
  });

  bot.addCommand('@endgame', async (o:IPayload) => {
    return await resetFrame();
  });

  // example of self command:
  bot.addCommand('@mirrormirror', async (o:IPayload) => {
    return bot.say('...on the wall');
  });
  bot.addCommand('@selfCommand', async (o:IPayload) => {
    return bot.selfCommand('!mirrormirror');
  });
};

export default plugins;
