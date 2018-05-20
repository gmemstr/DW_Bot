import environment from './environment';
import * as process from 'process';
import { TwitchBot } from './twitch.bot';
import { DiscordBot } from './discord.bot';
import plugins from './plugins';

const app: {[key: string]: any, twitch: TwitchBot | null} = {
  twitch: null,
  discord: null,
};

const connectBots = async (): Promise<void> => {
  const twitch = new TwitchBot(environment.bot);
  const discord = new DiscordBot(environment.discord);
  plugins(twitch, discord);
  await twitch.connect();
  await discord.connect();
  app.twitch = twitch;
  app.discord = discord;
  process.on('SIGINT', async () => {
    const exitItems = app.twitch.getExitItems();
    for (const fun of exitItems) {
      await fun.call();
    }
    process.exit(0);
  });
  return;
};

setImmediate(async () => {
  await connectBots();
});
