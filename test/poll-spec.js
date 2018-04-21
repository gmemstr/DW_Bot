import test from 'ava';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/twitch.bot';
import { PollPlugin } from '../lib/plugins/poll.plugin';
const bot = new TwitchBot(environment.bot);

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test('getQuestion returns question info. #unit', t => {
  const poll = new PollPlugin(bot);
  const q = `What IDE do you use?`;
  const actual = poll.getQuestion(`${q} | option a | option b | option c`);
  const expected = q;
  t.is(actual, expected);
});

test('getOptions returns array of options. #unit', t => {
  const poll = new PollPlugin(bot);
  const o = ['option a', 'option b', 'option c'];
  const actual = poll.getOptions(`What IDE do you use? | option a | option b | option c`);
  console.log(`actual`);
  console.log(actual);
  const expected = o;
  t.deepEqual(actual, expected);
});


test('getOptions will take out option if it is empty. #unit', t => {
  const poll = new PollPlugin(bot);
  const actual = poll.getOptions(`What IDE do you use? | option a | | option c | `);
  console.log(`actual take out`);
  console.log(actual);
  t.is(actual.length, 2);
});

test('alphabetPosition -> optionExists returns true if option is available. #unit', t => {
  const poll = new PollPlugin(bot);
  poll.options = poll.getOptions(`What IDE do you use? | option a | option b | option c`);
  t.true(poll.optionExists(PollPlugin.alphabetPosition('a'))); // 0
  t.true(poll.optionExists(PollPlugin.alphabetPosition('b'))); // 1
  t.true(poll.optionExists(PollPlugin.alphabetPosition('c'))); // 2
});

test.only('alphabetPosition -> optionExists returns false if option is not found. #unit', t => {
  const poll = new PollPlugin(bot);
  poll.options = poll.getOptions(`What IDE do you use? | option a | option b | option c`);
  t.false(poll.optionExists(PollPlugin.alphabetPosition('p')));
  t.false(poll.optionExists(PollPlugin.alphabetPosition('e')));
  t.false(poll.optionExists(PollPlugin.alphabetPosition('f')));
});

