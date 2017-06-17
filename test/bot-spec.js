import test from 'ava';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
const bot = new TwitchBot(environment.bot);

test('isCommand returns true on valid format inputs', t => {
  t.true(bot.isCommand('!hello'));
  t.true(bot.isCommand('!h'));
});

test('isCommand returns false on invalid formatted inputs.', t => {
  t.false(bot.isCommand('/!hello'));
  t.false(bot.isCommand(' !hello'));
  t.false(bot.isCommand('#hello'))
});

test('isCommand returns false when user only inputs just command character', t => {
  t.false(bot.isCommand('!'));
  t.false(bot.isCommand('! '))
});
