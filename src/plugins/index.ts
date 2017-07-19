import { IPayload, TwitchBot } from '../bot';
import { BettingPlugin } from './betting';
import { getBits } from '../services/user.service';

const plugins = (bot: TwitchBot) => {
  new BettingPlugin(bot);
  bot.addCommand('*devbits', async (o:IPayload) => {
    const bits = await getBits(o.user.username);
    return bot.say(`${o.user.username}: ${bits}`);
  });

  bot.addCommand('*bits', async (o:IPayload) => {
    const bits = await getBits(o.user.username);
    return bot.say(`${o.user.username}: ${bits}`);
  });
};

export default plugins;
