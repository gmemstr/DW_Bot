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

test('checkPermissions returns correctly on different command exes for sub.', t => {
  const user = {
    mod: false,
    subscriber: true,
  };
  const input = {
    user,
    msg: '!checkSubPerms please!',
  };
  const SubCommand = '$checkSubPerms';
  const ModCommand = '@checkModPerms';
  bot.addCommand(SubCommand, () => {});
  bot.addCommand(ModCommand, () => {});
  t.true(bot.checkPermissions(input));
  input.msg = '!checkModPerms please!';
  t.false(bot.checkPermissions(input));
});

test('checkPermissions returns correctly on different command exes for user.', t => {
  const user = {
    mod: false,
    subscriber: false,
  };
  const input = {
    user,
    msg: '!checkSubPerms2 please!',
  };
  const SubCommand = '$checkSubPerms2';
  const ModCommand = '@checkModPerms2';
  bot.addCommand(SubCommand, () => {});
  bot.addCommand(ModCommand, () => {});
  t.false(bot.checkPermissions(input));
  input.msg = '!checkModPerms2 please!';
  t.false(bot.checkPermissions(input));
});

test('checkPermissions returns correctly on different command exes for mod.', t => {
  const user = {
    mod: true,
    subscriber: false,
  };
  const input = {
    user,
    msg: '!checkSubPerms3 please!',
  };
  const SubCommand = '$checkSubPerms3';
  const ModCommand = '@checkModPerms3';
  bot.addCommand(SubCommand, () => {});
  bot.addCommand(ModCommand, () => {});
  t.false(bot.checkPermissions(input));
  input.msg = '!checkModPerms3 please!';
  t.true(bot.checkPermissions(input));
});

test('checkPermissions returns true on command with * id.', t => {
  const user = {
    mod: false,
    subscriber: false,
  };
  const input = {
    user,
    msg: '!everyoneCanUseThisCommand please!',
  };
  const eCommand = '*everyoneCanUseThisCommand';
  bot.addCommand(eCommand, () => {});
  t.true(bot.checkPermissions(input));
});


test('getArgumentsFromMsg returns array in correct format if multiple args are present.', t => {
  const testMessage = '!bot Can you PARSE this 1 thing?';
  const args = bot.getArgumentsFromMsg(testMessage);
  console.log(`args`);
  console.log(args);
  t.deepEqual(['can', 'you', 'parse', 'this', 1, 'thing?'], args);
});

test('getArgumentsFromMsg returns array if only 1 arg present.', t => {
  const testMessage = '!bot please';
  const args = bot.getArgumentsFromMsg(testMessage);
  t.deepEqual(['please'], args);
});

test('getArgumentsFromMsg returns false if only command is present.', t => {
  const testMessage = '!returnFalse';
  const args = bot.getArgumentsFromMsg(testMessage);
  t.false(args);
});
