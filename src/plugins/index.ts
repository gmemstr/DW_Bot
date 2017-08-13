import { IPayload, TwitchBot } from '../bot';
import { BettingPlugin } from './betting.plugin';
import { getBits } from '../services/user.service';
import { switchStage } from '../services/firebase.service';
import { getStreamInfo } from '../services/twitch.service';
import { BPMPlugin } from './bpm.plugin';
import { VotingPlugin } from './voting.plugin';

const plugins = (bot: TwitchBot) => {
  new BettingPlugin(bot);
  new BPMPlugin(bot);
  new VotingPlugin(bot);

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

  bot.addCommand('@channel', async (o:IPayload) => {
    return getStreamInfo('beleek');
  });
};

export default plugins;
