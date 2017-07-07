import test from 'ava';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
import { BettingPlugin } from '../lib/plugins/betting';
const bot = new TwitchBot(environment.bot);
const betting = new BettingPlugin(bot);


/*
 * betting docs:
 * https://docs.google.com/spreadsheets/d/1kg4zsgf2d_FqbshCdTii3oZnU_W5Imlj_ka6sRfaiCk/edit#gid=2069817316
 */

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ghostBetters = [
  {name: 'Gastly', tier: 3, team: 'blue', amount: 300, winnings: 0},
  {name: 'Haunter', tier: 4, team: 'tie', amount: 300, winnings: 0},
  {name: 'Gengar', tier: 5, team: 'red', amount: 300, winnings: 0},
];

test('validObjective returns TRUE if VALID arguments are passed in.', t => {
  t.true(betting.validObjective('ace') === 'ace');
  t.true(betting.validObjective(0) === 0);
  t.true(betting.validObjective(1) === 1);
  t.true(betting.validObjective(2) === 2);
  t.true(betting.validObjective(3) === 3);
  t.true(betting.validObjective(4) === 4);
  t.true(betting.validObjective(5) === 5);
  t.true(betting.validObjective('5') === 5);
});

test('validObjective returns FALSE if INVALID arguments are passed in.', t => {
  t.false(betting.validObjective(-1));
  t.false(betting.validObjective(6));
  t.false(betting.validObjective('eca'));
  t.false(betting.validObjective('6'));
  t.false(betting.validObjective('-1'));
  t.false(betting.validObjective(false));
});

test('validStrikes returns TRUE if VALID arguments are passed in.', t => {
  t.true(betting.validStrikes('x') === 'x');
  t.true(betting.validStrikes('xx') === 'xx');
  t.true(betting.validStrikes('xxx') === 'xxx');
});

test('validStrikes returns FALSE if INVALID arguments are passed in.', t => {
  t.false(betting.validStrikes());
  t.false(betting.validStrikes(-1));
  t.false(betting.validStrikes(false));
  t.false(betting.validStrikes('xxxx'));
});
