import { DPayload, IPayload } from '../interfaces';
import {  TwitchBot } from '../twitch.bot';
import { BettingPlugin } from './betting.plugin';
import {
  bitsLeaderboard, getBits,
  xpLeaderboard,
} from '../services/user.service';
import {
  addTime, emptyFrameBetters, listenForStageChange, resetFrame, startTimer,
  switchStage,
} from '../services/firebase.service';
import { getStreamInfo } from '../services/twitch.service';
import { currentGame } from '../services/game.service';
import { BPMPlugin } from './bpm.plugin';
import { VotingPlugin } from './voting.plugin';
import { ApplyPlugin } from './apply.plugin';
import { AnalyticsPlugin } from './analytics.plugin';
import { channels, DiscordBot } from '../discord.bot';
import { PollPlugin } from './poll.plugin';

const plugins = (twitch: TwitchBot, discord: DiscordBot) => {
  let listenForChanges = false;
  new BettingPlugin(twitch);
  new BPMPlugin(twitch);
  new VotingPlugin(twitch);
  new ApplyPlugin(twitch, discord);
  new AnalyticsPlugin();
  new PollPlugin(twitch);

  listenForStageChange((state) => {
    // don't listen for changes on bot bootup.
    if (listenForChanges === false) {
      return listenForChanges = true;
    }
    if (state === 'running') {
      return twitch.selfCommand('!startgame');
    }
  });

  twitch.addCommand('@startgame', async () => {
    try {
      const game = await currentGame();
      const theme = game.name || 'Classic';
      await Promise
        .all([switchStage('objective'), startTimer()]);

      await twitch.say('Starting Game!');

      if (theme.toLowerCase().includes('zen')) {
        await twitch.say('bets are closed for this game.');
      } else {
        await twitch.say('betting will open in 5 minutes.');
        setTimeout(() => twitch.selfCommand('!openbets'), 300000);
      }

    } catch (e) {
      TwitchBot.sysLog('error', 'Problems with startGame command', '~', e);
    }
  });

  twitch.addCommand(['*coins', '*devcoins'], async (p:IPayload) => {
    const bits = await getBits(p.user.username);
    const commaSep = TwitchBot.thousands(bits);
    return p.reply(`devwarsCoin ${commaSep}`);
    // return twitch.say(`${o.user.username}: devwarsCoin ${commaSep}`);
  });

  twitch.addCommand('@stage', async (o:IPayload) => {
    const stage = o.args[0] || 'objective';
    return switchStage(stage);
  });

  twitch.addCommand('@addtime', async (o:IPayload) => {
    // user input will be in minute format. So !addtime 1 should add 1m.
    const ms = Math.floor(o.args[0] * 60 * 1000);
    return addTime(ms);
  });

  twitch.addCommand('@channel', async () => {
    return getStreamInfo('beleek');
  });

  twitch.addCommand('@endgame', async () => {
    return await resetFrame();
  });

  twitch.addCommand('*livecode', () =>
    twitch.say('Watch the code in real-time https://watch.devwars.tv'), 900);

  twitch.addCommand('*watchred', () =>
    twitch.say('View Red Team\'s website https://red.devwars.tv'), 900);

  twitch.addCommand('*watchblue', () =>
    twitch.say('View Blue Team\'s website https://blue.devwars.tv'), 900);

  twitch.addCommand('*discord', () =>
    twitch.say('https://discord.gg/devwars'), 900);

  // twitch.addCommand('*coinsleader', async () => {
  //   const leadersArr = await bitsLeaderboard();
  //   twitch
  //     .say(`1. ${leadersArr[0].username} - ${leadersArr[0].ranking.points}`);
  //   twitch
  //     .say(`2. ${leadersArr[1].username} - ${leadersArr[1].ranking.points}`);
  //   twitch
  //     .say(`3. ${leadersArr[2].username} - ${leadersArr[2].ranking.points}`);
  // }, TwitchBot.ms(1, 'minutes'));

  // twitch.addCommand('*xpleader', async () => {
  //   const leadersArr = await xpLeaderboard();
  //   twitch
  //     .say(`1. ${leadersArr[0].username} - ${leadersArr[0].ranking.xp}xp`);
  //   twitch
  //     .say(`2. ${leadersArr[1].username} - ${leadersArr[1].ranking.xp}xp`);
  //   twitch
  //     .say(`3. ${leadersArr[2].username} - ${leadersArr[2].ranking.xp}xp`);
  // }, TwitchBot.ms(1, 'minutes'));

  twitch.addCommand('@testReply', async (p:IPayload) => {
    return p.reply(`Here's your reply!`);
  });

  twitch.addCommand('*fire', p =>
    p.reply('🔥'), TwitchBot.ms(45, 'minutes'));

  twitch.addCommand('@emptyframepool', () => emptyFrameBetters());

  // example of self command:
  twitch.addCommand('@mirrormirror', async () => {
    return twitch.say('...on the wall');
  });
  twitch.addCommand('@selfCommand', async () => {
    return twitch.selfCommand('!mirrormirror');
  });

  discord.addCommand('D*ping', async () => {
    return discord.say('pong', channels.bot_testing);
  });

  discord.addCommand('D@mod', async (o:DPayload) => {
    discord.say('saying something', channels.bot_testing);
    return o.reply('confirmed mod');
  });
};

export default plugins;
