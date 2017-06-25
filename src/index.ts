import environment from './environment';
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
  return;
};

setImmediate(async () => {
  await connectBot();
  setTimeout(() => { app.bot.say('hello world.'); }, 9000);
});
