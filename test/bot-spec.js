import test from 'ava';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/twitch.bot';
const bot = new TwitchBot(environment.bot);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('isCommand returns true on valid format inputs #unit', t => {
  t.true(bot.isCommand('!hello'));
  t.true(bot.isCommand('!h'));
});

test('isCommand returns false if user message does not begin command character #unit', t => {
  t.false(bot.isCommand('/!hello'));
  t.false(bot.isCommand(' !hello'));
  t.false(bot.isCommand('#hello'));
});

test('isCommand returns false when user only inputs just command character #unit', t => {
  t.false(bot.isCommand('!'));
  t.false(bot.isCommand('! '));
});

test('addCommand throws error if it does not include a identifier character. #unit', t => {
  t.throws(() => bot.addCommand('hey', () => {}));
});

test('addCommand can be found in commands if it does not throw. #unit', t => {
  const command = '$heyman';
  t.notThrows(() => bot.addCommand(command, () => true));
  t.true(bot.commands[command.substr(1)].action());
});

test('addCommand works for an array of commands. #unit', t => {
  const cmdOne = '$one';
  const cmdTwo = '@two';
  t.notThrows(() => bot.addCommand([cmdOne, cmdTwo], () => true));
  t.true(bot.commands[cmdOne.substr(1)].action());
  t.true(bot.commands[cmdTwo.substr(1)].action());
});

test('command can be found if after addCommand method #unit', t => {
  // identifier + string = command;
  const identifier = '$';
  const string = 'testing';
  bot.addCommand(`${identifier}${string}`, () => {});
  t.true(bot.commands[string] !== undefined);
});

test('command\'s action can be executed after addCommand method #integration', t => {
  const id = '*';
  const string = 'add';
  bot.addCommand(`${id}${string}`, () => true);
  t.true(bot.commands[string].action() === true);
});

test('normalizeMessage returns command from user input message #unit', t => {
  t.true(TwitchBot.normalizeMessage('!Hey') === '!hey');
  t.true(TwitchBot.normalizeMessage('!foreVer young') === '!forever');
  t.true(TwitchBot.normalizeMessage('!hey ') === '!hey');
});

test('checkDebounce returns false if time past is < debounce time #unit', async t => {
  const payload = {
    args: [],
    user: 'Divine_Don',
    from: 'Divine_Don',
    command: '$defalse',
  };
  bot.addCommand(payload.command, () => {}, 1000);
  bot.doCommand(payload);
  await timeout(500);
  // should return false because wait time does NOT exceed debounce.
  t.false(bot.checkDebounce(payload.command));
});

test('checkDebounce returns true if time past is > debounce time #unit', async t => {
  const payload = {
    args: [],
    user: 'Divine_Don',
    from: 'Divine_Don',
    command: '$m',
  };
  const command = '$m';
  bot.addCommand(payload.command, () => true, 1000);
  bot.doCommand(payload);
  await timeout(2000);
  t.true(bot.checkDebounce(command));
});

test('checkPermissions returns correctly on different command exes for sub. #unit', t => {
  const user = {
    mod: false,
    subscriber: true,
    badges: {broadcaster: false}
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

test('checkPermissions returns correctly on different command exes for user. #unit', t => {
  const user = {
    mod: false,
    subscriber: false,
    badges: {broadcaster: false}
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

test('checkPermissions returns correctly on different command exes for mod. #unit', t => {
  const user = {
    mod: true,
    subscriber: false,
    badges: {broadcaster: false}
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

test('checkPermissions returns true on command with * id. #unit', t => {
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


test('getArgumentsFromMsg returns array in correct format if multiple args are present. #unit', t => {
  const testMessage = '!bot Can you PARSE this 1 thing?';
  const args = bot.getArgumentsFromMsg(testMessage);
  t.deepEqual(['can', 'you', 'parse', 'this', 1, 'thing?'], args);
});

test('getArgumentsFromMsg returns array if only 1 arg present. #unit', t => {
  const testMessage = '!bot please';
  const args = bot.getArgumentsFromMsg(testMessage);
  t.deepEqual(['please'], args);
});

test('getArgumentsFromMsg returns empty array if only command is present. #unit', t => {
  const testMessage = '!returnFalse';
  const args = bot.getArgumentsFromMsg(testMessage);
  t.true(args.length === 0);
});

test('Twitch addCommand disregards discord specific commands. #unit', t => {
  const string = 'fakeCommand';
  bot.addCommand(`D*${string}`, () => true);
  bot.addCommand(`d*${string}`, () => true);
  t.is(bot.commands[string], undefined);
});
