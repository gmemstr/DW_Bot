import environment from './environment';
import { TwitchBot } from './bot';

const app: {[key: string]: any, bot: TwitchBot | null} = {
  bot: null,
};

const connectBot = async (): Promise<void> => {
  const bot = new TwitchBot(environment.bot);
  await bot.connect();
  app.bot = bot;
  return;
};

setImmediate(async () => {
  await connectBot();
  setTimeout(() => { app.bot.say('hello world.'); }, 9000);
});
