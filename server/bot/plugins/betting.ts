import * as request from 'request';
import config from '../../config/environment';
import {create as createTest} from '../../api/test/test.controller.ts';
import Test from '../../api/test/test.model.ts';
import * as gameService from '../../services/game.service'
import * as _ from 'lodash';

interface Better {
  name: String;
  tier: Number;
  team: String;
  amount: Number;
}

interface Betting {
  gameId: Number;
  bets: Array<Better>;
}

class Pool implements Betting {
  constructor(public gameId:Number, public bets:Array<Better>) {}

  set better(person: Better) {
    const {name, tier, team, amount} = person;
    if (_.find(this.bets, {name: name})) {
      console.log("found better");
    } else {
      console.log("didn't find better");

      this.bets.push(person);
    }
  }
}

const bettingTeams = ['blue', 'red'];
const bettingTiers = [1, 2, 3, 4, 5, 'tie'];
const bettingOdds = [(2 / 7), (1 / 10), (2 / 10), (5 / 10), (1 / 1), (2 / 1)];

const minBet = 10;
const maxBet = 10000;

export default function (bot) {
  var bettingPool = null;
  bot.addCommand('*bet', function () {
    bot.say('we got your bet.');
  });

  bot.addCommand('@openbets', function () {
    if (bettingPool) {
      return bot.say('Betting already in progress')
    } else {
      gameService.getCurrentGameId((id) => {
        if (!id) return bot.say('error getting current game.');

        bettingPool = new Pool(id, []);
        bot.say(`Betting is now open for game #${id}`);
      })
    }
  });


  bot.addCommand('*bet', function (o) {
    if (!bettingPool) return bot.say('Betting is not in progress.');

    const from = o.from;
    const [tier, team, amount] = o.args;

    if (~bettingTiers.indexOf(tier) && ~bettingTeams.indexOf(team) &&
      isNaN(amount) === false &&
      amount >= minBet &&
      amount <= maxBet) {

      bettingPool.better = {name: from, tier: tier, team: team, amount: amount};


      console.log("bettingPool.bets", bettingPool);


    }
  })

};
