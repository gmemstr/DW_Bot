import { IPayload, TwitchBot } from '../bot';
import { BettingPlugin } from './betting';
import { getDevBits } from '../services/user.service';

const plugins = (bot: TwitchBot) => {
  new BettingPlugin(bot);
  bot.addCommand('*devbits', async (o:IPayload) => {
    console.log(`o:`);
    console.log(o);
    const bits = await getDevBits(o.user.username);
    return bot.say(`${o.user.username}: ${bits}`);
  });
};

export default plugins;
