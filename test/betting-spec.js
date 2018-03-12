import test from 'ava';
import * as _ from 'lodash';
import environment from '../lib/environment'
import { TwitchBot } from '../lib/bot';
import { BettingPlugin } from '../lib/plugins/betting.plugin';
import { getBits, putBits } from '../lib/services/user.service';
import {addFrameBet, emptyFrameBetters, getFrameBetters} from '../lib/services/firebase.service';

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
  t.true(BettingPlugin.validObjective('ace') === 5);
  t.true(BettingPlugin.validObjective(0) === 0);
  t.true(BettingPlugin.validObjective(1) === 1);
  t.true(BettingPlugin.validObjective(2) === 2);
  t.true(BettingPlugin.validObjective(3) === 3);
  t.true(BettingPlugin.validObjective(4) === 4);
  t.true(BettingPlugin.validObjective(5) === 5);
  t.true(BettingPlugin.validObjective('5') === 5);
});

test('validObjective returns FALSE if INVALID arguments are passed in. #unit', t => {
  t.false(BettingPlugin.validObjective(-1) === -1);
  t.false(BettingPlugin.validObjective(6) === 6);
  t.false(BettingPlugin.validObjective('eca') === 'eca');
  t.false(BettingPlugin.validObjective('6') === '6');
  t.false(BettingPlugin.validObjective('-1') === '-1');
  t.false(BettingPlugin.validObjective(false) === false);
});

test('validStrikes returns TRUE if VALID arguments are passed in. #unit', t => {
  t.true(BettingPlugin.validStrikes('x') === 'x');
  t.true(BettingPlugin.validStrikes('xx') === 'xx');
  t.true(BettingPlugin.validStrikes('xxx') === 'xxx');
});

test('validStrikes returns FALSE if INVALID arguments are passed in. #unit', t => {
  t.false(BettingPlugin.validStrikes());
  t.false(BettingPlugin.validStrikes(-1));
  t.false(BettingPlugin.validStrikes(false));
  t.false(BettingPlugin.validStrikes('xxxx'));
});

test('validAmount return FALSE if INVALID amount number is passed in. #unit', t => {
  t.false(BettingPlugin.validAmount(-2));
  t.false(BettingPlugin.validAmount('-2000000000'));
  t.false(BettingPlugin.validAmount('-20,000'));
  t.false(BettingPlugin.validAmount(0));
  t.false(BettingPlugin.validAmount(1.1));
  t.false(BettingPlugin.validAmount(0.5));
});

test('validAmount returns a number if VALID number amount is passed in. #unit', t => {
  t.true(BettingPlugin.validAmount(10) === 10);
  t.true(BettingPlugin.validAmount(100) === 100);
  t.true(BettingPlugin.validAmount('5,000') === 5000);
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
  const better = ghostBetters[4];
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
  const better = BettingPlugin.formatBetter(user.name, [user.amount, user.team]);
  t.true(better.name === user.name);
  t.true(better.amount === user.amount);
});

test('Winner command successfully gives user winnings. #integration', async t => {
  const plugin = new BettingPlugin(bot);
  const winner3 = ghostBetters[3];

  // get current number of bits user has.
  const currentWinner3 = await getBits(winner3.name);
  await plugin.addBet(winner3);
  const winnings3 = await plugin.oddsWinnings(winner3);
  await plugin.winner(winner3.team, winner3.mods.objectives + 1);

  await timeout(5000);

  const afterWin3 = await getBits(winner3.name);
  t.true(currentWinner3 + winnings3 ===  afterWin3)
});


test('Firebase better methods. #integration', async t  => {
  const bet = {
    name: ghostBetters[0].name,
    amount: ghostBetters[0].amount,
    team: ghostBetters[0].team,
    timestamp: ''
  };
  let actual = [];
  await emptyFrameBetters();
  await addFrameBet(bet.name, bet.amount, bet.team);
  // make sure better has been added.
  const bettersObject = await getFrameBetters();
  for (let better in bettersObject) {
    // remove timestamp
    bettersObject[better].timestamp = '';
    actual.push(bettersObject[better]);
  }
  t.deepEqual(actual, [bet])
});


test.only('Make sure if user over bets more than they can afford, their new bet is declined and old bet is returned. #integration', async t => {
  const name = 'dw_bot';
  const coinsAmount = await getBits(name);
  const plugin = new BettingPlugin(bot);
  const bet = { name: name, amount: Math.ceil(coinsAmount * .50), team: 'red', winnings: 0,
    mods: {
      objectives: 0,
      strikes: false
    }
  };

  await plugin.addBet(bet);

  t.true(plugin.hasBet(name));
  // If the same user places another bet (but this time more than they can afford), they should not have any bets.
  await plugin.addBet({ name: name, amount: coinsAmount * 99999999, team: 'red', winnings: 0,
    mods: {
      objectives: 0,
      strikes: false,
    }
  });

  // User has not bets in pool
  t.false(plugin.hasBet(name));
  // Users original bet has been returned:
  t.true(coinsAmount === await getBits(name));
});
