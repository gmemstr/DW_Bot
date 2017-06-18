import test from 'ava';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
const bot = new TwitchBot(environment.bot);

test('isCommand returns true on valid format inputs', t => {
  t.true(bot.isCommand('!hello'));
  t.true(bot.isCommand('!h'));
});

test('isCommand returns false if user message does not begin command character', t => {
  t.false(bot.isCommand('/!hello'));
  t.false(bot.isCommand(' !hello'));
  t.false(bot.isCommand('#hello'));
});

test('isCommand returns false when user only inputs just command character', t => {
  t.false(bot.isCommand('!'));
  t.false(bot.isCommand('! '));
});

test('addCommand throws error if it does not include a identifier character.', t => {
  t.throws(() => bot.addCommand('hey', () => {}));
});

test('addCommand can be found in commands if it does not throw.', t => {
  const command = '$highfive';
  t.notThrows(() => bot.addCommand(command, () => {}));
});

test('command can be found if after addCommand method', t => {
  // identifier + string = command;
  const identifier = '$';
  const string = 'testing';
  bot.addCommand(`${identifier}${string}`, () => {});
  t.true(bot.commands[string] !== undefined);
});
