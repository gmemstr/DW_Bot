import { TwitchBot } from '../bot';
import { BettingPlugin } from './betting';
const plugins = (bot: TwitchBot) => {
  new BettingPlugin(bot);
};

export default plugins;
