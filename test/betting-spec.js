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
  { // !bet 300 blue
    name: 'Gastly',
    team: 'blue',
    amount: 300,
    winnings: 150,
    mods: {objectives: 0, strikes: false}
  },
  { // !bet 300 blue 3
    name: 'Haunter',
    team: 'blue',
    amount: 300,
    winnings: 0,
    mods: {objectives: 3, strikes: false}
  },
  { // !bet 300 red ace
    name: 'Gengar',
    team: 'red',
    amount: 300,
    winnings: 0,
    mods: {objectives: 5, strikes: false}
  },
];

test('validObjective returns TRUE if VALID arguments are passed in.', t => {
  t.true(betting.validObjective('ace') === 5);
  t.true(betting.validObjective(0) === 0);
  t.true(betting.validObjective(1) === 1);
  t.true(betting.validObjective(2) === 2);
  t.true(betting.validObjective(3) === 3);
  t.true(betting.validObjective(4) === 4);
  t.true(betting.validObjective(5) === 5);
  t.true(betting.validObjective('5') === 5);
});

test('validObjective returns FALSE if INVALID arguments are passed in.', t => {
  t.false(betting.validObjective(-1) === -1);
  t.false(betting.validObjective(6) === 6);
  t.false(betting.validObjective('eca') === 'eca');
  t.false(betting.validObjective('6') === '6');
  t.false(betting.validObjective('-1') === '-1');
  t.false(betting.validObjective(false) === false);
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

test('oddsWinnings calculate the correct objective bet modifier based Better object.', t => {
  const values = betting.oddValues;
  // TODO: you can do better than this travesty.
  t.true(
    betting.oddsWinnings(ghostBetters[0])
    ===
    ghostBetters[0].amount * values[ghostBetters[0].mods.objectives]
  );
  t.true(
    betting.oddsWinnings(ghostBetters[1])
    ===
    ghostBetters[1].amount * values[ghostBetters[1].mods.objectives]
  );
  t.true(
    betting.oddsWinnings(ghostBetters[2])
    ===
    ghostBetters[2].amount * values[ghostBetters[2].mods.objectives]
  )
});
