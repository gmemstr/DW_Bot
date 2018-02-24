import { IPayload } from '../interfaces';
import {  TwitchBot } from '../bot';
import { BettingPlugin } from './betting.plugin';
import {
  bitsLeaderboard, getBits,
  xpLeaderboard,
} from '../services/user.service';
import {
  addTime, listenForStageChange, resetFrame, startTimer,
  switchStage,
  updateFrame,
} from '../services/firebase.service';
import { getStreamInfo } from '../services/twitch.service';
import { currentGame } from '../services/game.service';
import { BPMPlugin } from './bpm.plugin';
import { VotingPlugin } from './voting.plugin';
import { ApplyPlugin } from './apply.plugin';

const plugins = (bot: TwitchBot) => {
  let listenForChanges = false;
  new BettingPlugin(bot);
  new BPMPlugin(bot);
  new VotingPlugin(bot);
  new ApplyPlugin(bot);

  listenForStageChange((state) => {
    // don't listen for changes on bot bootup.
    if (listenForChanges === false) {
      return listenForChanges = true;
    }
    if (state === 'running') {
      return bot.selfCommand('!startgame');
    }
  });

  bot.addCommand('@startgame', async () => {
    try {
      const game = await currentGame();
      const theme = game.theme || 'Classic';
      await Promise
        .all([switchStage('objective'), updateFrame({ game }), startTimer()]);

      await bot.say('Starting Game!');

      if (theme.toLowerCase() === 'zen garden') {
        await bot.say('bets are closed for this game.');
      } else {
        await bot.say('betting will open in 5 minutes.');
        setTimeout(() => bot.selfCommand('!openbets'), 300000);
      }

    } catch (e) {
      TwitchBot.sysLog('error', 'Problems with startGame command', '~', e);
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

  bot.addCommand('@channel', async () => {
    return getStreamInfo('beleek');
  });

  bot.addCommand('@endgame', async () => {
    return await resetFrame();
  });

  bot.addCommand('*livecode', () =>
    bot.say('Watch the code in real-time https://watch.devwars.tv'), 900);

  bot.addCommand('*watchred', () =>
    bot.say('View Red Team\'s website https://red.devwars.tv'), 900);

  bot.addCommand('*watchblue', () =>
    bot.say('View Blue Team\'s website https://blue.devwars.tv'), 900);

  bot.addCommand('*discord', () => bot.say('https://discord.gg/devwars'), 900);

  bot.addCommand('*bitsleader', async () => {
    const leadersArr = await bitsLeaderboard();
    bot.say(`1. ${leadersArr[0].username} - ${leadersArr[0].ranking.points}`);
    bot.say(`2. ${leadersArr[1].username} - ${leadersArr[1].ranking.points}`);
    bot.say(`3. ${leadersArr[2].username} - ${leadersArr[2].ranking.points}`);
  }, 5000);

  bot.addCommand('*xpleader', async () => {
    const leadersArr = await xpLeaderboard();
    bot.say(`1. ${leadersArr[0].username} - ${leadersArr[0].ranking.xp}xp`);
    bot.say(`2. ${leadersArr[1].username} - ${leadersArr[1].ranking.xp}xp`);
    bot.say(`3. ${leadersArr[2].username} - ${leadersArr[2].ranking.xp}xp`);
  }, 5000);

  bot.addCommand('*fire', () => bot.say('🔥'), 289900);

  // example of self command:
  bot.addCommand('@mirrormirror', async () => {
    return bot.say('...on the wall');
  });
  bot.addCommand('@selfCommand', async () => {
    return bot.selfCommand('!mirrormirror');
  });
};

export default plugins;
