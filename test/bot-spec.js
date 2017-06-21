import test from 'ava';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
const bot = new TwitchBot(environment.bot);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  const command = '$heyman';
  t.notThrows(() => bot.addCommand(command, () => true));
  t.true(bot.commands[command.substr(1)].action());
});

test('command can be found if after addCommand method', t => {
  // identifier + string = command;
  const identifier = '$';
  const string = 'testing';
  bot.addCommand(`${identifier}${string}`, () => {});
  t.true(bot.commands[string] !== undefined);
});

test('command\'s action can be executed after addCommand method', t => {
  const id = '*';
  const string = 'add';
  bot.addCommand(`${id}${string}`, () => true);
  t.true(bot.commands[string].action() === true);
});

test('normalizeMessage returns command from user input message', t => {
  t.true(bot.normalizeMessage('!Hey') === '!hey');
  t.true(bot.normalizeMessage('!foreVer young') === '!forever');
  t.true(bot.normalizeMessage('!hey ') === '!hey');
});

test('checkDebounce returns false if time past is < debounce time', async t => {
  const command = '$defalse';
  bot.addCommand(command, () => {}, 1000);
  await timeout(500);
  // should return false because wait time does NOT exceed debounce.
  t.false(bot.checkDebounce(command));
});

test('checkDebounce returns true if time past is > debounce time', async t => {
  const command = '$m';
  bot.addCommand(command, () => true, 1000);
  await timeout(2000);
  t.true(bot.checkDebounce(command));
});
