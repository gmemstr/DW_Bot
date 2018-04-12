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

test.only('getOptions returns array of options. #unit', t => {
  const poll = new PollPlugin(bot);
  const o = ['option a', 'option b', 'option c'];
  const actual = poll.getOptions(`What IDE do you use? | option a | option b | option c`);
  console.log(`actual`);
  console.log(actual);
  const expected = o;
  t.is(actual, expected);
});
