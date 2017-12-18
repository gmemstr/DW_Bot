import environment from './environment';
import * as process from 'process';
import { TwitchBot } from './bot';
import plugins from './plugins';

const app: {[key: string]: any, bot: TwitchBot | null} = {
  bot: null,
};

const connectBot = async (): Promise<void> => {
  const bot = new TwitchBot(environment.bot);
  plugins(bot);
  await bot.connect();
  app.bot = bot;
  process.on('SIGINT', async () => {
    const exitItems = app.bot.getExitItems();
    for (const fun of exitItems) {
      await fun.call();
    }
    process.exit(0);
  });
  return;
};

setImmediate(async () => {
  await connectBot();
});
