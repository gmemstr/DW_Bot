import test from 'ava';
import * as _ from 'lodash';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
import { BettingPlugin } from '../lib/plugins/betting.plugin';
import { getBits, putBits } from '../lib/services/user.service';

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
    // note: user can't bet 0 objectives.
    // 0 is just a placeholder for if the user doesn't specify an objective.
    // This basically means the user just places a bet on a team to win.
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
  { // !bet 300 red ace
    name: 'divine_don',
    team: 'red',
    amount: 300,
    winnings: 0,
    mods: {objectives: 5, strikes: false}
  },
  { // !bet 300 blue ace
    name: 'syntag',
    team: 'blue',
    amount: 300,
    winnings: 0,
    mods: {objectives: 5, strikes: false}
  },
  { // !bet 300 blue ace
    name: 'format_me',
    team: 'blue',
    amount: 300,
    winnings: 0,
    mods: {objectives: 5, strikes: false}
  }
];

test('validObjective returns TRUE if VALID arguments are passed in. #unit', t => {
  t.true(betting.validObjective('ace') === 5);
  t.true(betting.validObjective(0) === 0);
  t.true(betting.validObjective(1) === 1);
  t.true(betting.validObjective(2) === 2);
  t.true(betting.validObjective(3) === 3);
  t.true(betting.validObjective(4) === 4);
  t.true(betting.validObjective(5) === 5);
  t.true(betting.validObjective('5') === 5);
});

test('validObjective returns FALSE if INVALID arguments are passed in. #unit', t => {
  t.false(betting.validObjective(-1) === -1);
  t.false(betting.validObjective(6) === 6);
  t.false(betting.validObjective('eca') === 'eca');
  t.false(betting.validObjective('6') === '6');
  t.false(betting.validObjective('-1') === '-1');
  t.false(betting.validObjective(false) === false);
});

test('validStrikes returns TRUE if VALID arguments are passed in. #unit', t => {
  t.true(betting.validStrikes('x') === 'x');
  t.true(betting.validStrikes('xx') === 'xx');
  t.true(betting.validStrikes('xxx') === 'xxx');
});

test('validStrikes returns FALSE if INVALID arguments are passed in. #unit', t => {
  t.false(betting.validStrikes());
  t.false(betting.validStrikes(-1));
  t.false(betting.validStrikes(false));
  t.false(betting.validStrikes('xxxx'));
});

test('validAmount return FALSE if INVALID amount number is passed in. #unit', t => {
  t.false(betting.validAmount(1));
  t.false(betting.validAmount(99999999));
  t.false(betting.validAmount(-2));
  t.false(betting.validAmount('-2000000000'));
  t.false(betting.validAmount('-20,000'));
  t.false(betting.validAmount(0));
  t.false(betting.validAmount(1.1));
  t.false(betting.validAmount(0.5));
});

test('validAmount returns a number if VALID number amount is passed in. #unit', t => {
  t.true(betting.validAmount(10) === 10);
  t.true(betting.validAmount(100) === 100);
  t.true(betting.validAmount('5,000') === 5000);
});

test('oddsWinnings calculate the correct objective bet modifier based Better object. #unit', t => {
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

// Skipping this since it requires connection to chat.
test('addBet adds better to pool and removes bet amount. #integration', async (t) => {
  const better = ghostBetters[3];
  // put required amount of bits on account.
  await putBits(better.name, better.amount);
  // get current number of bits user has.
  const currentBits = await getBits(better.name);
  await betting.addBet(better);
  // make sure better is in betting pool.
  t.true(_.findIndex(betting.pool.bets, o => o.name === better.name) >= 0);
  // make sure the right number of bits where taken from user.
  t.true(await getBits(better.name) + better.amount === currentBits)
});

test('hasBet returns index number of better if better is found in pool. #unit', async (t) => {
  const better = ghostBetters[0];
  betting.pool.bets.push(better);
  t.true(betting.hasBet(better.name) >= 0);
});

test('hasBet returns false if better is not found in pool. #unit', t => {
  let better = ghostBetters[0];
  better.name += 'unique';
  t.false(betting.hasBet(ghostBetters.name));
});

test('formatBetter returns better object if correct params are passed in. #unit', t => {
  const user = ghostBetters[5];
  const better = betting.formatBetter(user.name, [user.amount, user.team]);
  t.true(better.name === user.name);
  t.true(better.amount === user.amount);
});
