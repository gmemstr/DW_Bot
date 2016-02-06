import * as request from 'request';
import config from '../../config/environment';
import {create as createTest} from '../../api/test/test.controller.ts';
import Test from '../../api/test/test.model.ts';
import * as gameService from '../../services/game.service';
import * as userService from '../../services/user.service';
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


const bettingTeams = ['blue', 'red'];
const bettingTiers = [1, 2, 3, 4, 5, 'tie'];
const bettingOdds = [(2 / 7), (1 / 10), (2 / 10), (5 / 10), (1 / 1), (2 / 1)];

const minBet = 10;
const maxBet = 10000;

export default function (bot) {

  class Pool implements Betting {
    constructor(public gameId:Number, public bets:Array<Better>) {}

    clearBet(name: String) {
      let person = _.find(this.bets, function(o) { return o.name === name; });
      userService.putDevbits(name, person.amount, res => {
        if (res) {
          console.log("person", person);
          bot.whisper(person.name, `Your bet of ${person.amount} on ${person.team} team has been returned.`);
          return delete this.bets[_.findIndex(this.bets, {name: name})];
        }
      });
    }

    set better(person: Better) {
      const {name, tier, team, amount} = person;
      if (_.find(this.bets, {name: name})) {
        console.log("found better", _.findIndex(this.bets, {name: name}));
        //replacing bet: return original bet and then take away
      } else {
        console.log("didn't find better");
        userService.putDevbits(name, -amount, () => {
          this.bets.push(person);
          bot.whisper(name, `We got your bet of ${amount} on ${team} team.`);

        });
      }
    }
  }


  var bettingPool = null;
  bot.addCommand('*bet', function () {
    bot.say('we got your bet.');
  });

  bot.addCommand('@openbets', function (o) {

    if (o.args[0]) { //TODO: remove this later.
      bot.say(`Betting is now open for game #${o.args[0]}`);
      return bettingPool = new Pool(o.args[0], [])
    }

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

      if (_.find(bettingPool.bets, {name: from})) {
        console.log('CLEAR BET: ', from);
        bettingPool.clearBet(from);
      }

      userService.hasDevbits(from, amount, status => {
        if (status) return bettingPool.better = {name: from, tier: tier, team: team, amount: amount};
        else if (!status) return bot.whisper(from, `You don't have the devbits!`);
      });

    }
  })

};
