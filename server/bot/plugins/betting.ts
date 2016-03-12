import * as request from 'request';
import config from '../../config/environment';
import * as gameService from '../../services/game.service';
import * as userService from '../../services/user.service';
import * as _ from 'lodash';
import * as moment from 'moment';

interface Better {
  name: String;
  tier: Number;
  team: String;
  amount: Number;
  winnings: Number
}

interface Betting {
  gameId: Number;
  bets: Array<Better>;
}

var bettingDuration = moment.duration(10, 'minutes');

const bettingTeams = ['blue', 'red'];
const bettingTiers = [1, 2, 3, 4, 5, 'tie'];
const bettingOdds = [(2 / 7), (1 / 10), (2 / 10), (5 / 10), (1 / 1), (2 / 1)];

const minBet = 10;
const maxBet = 10000;

//TODO: testing only.
const ghostBetters: Array<Better> = [
  {name: 'Gastly', tier: 3, team: 'blue', amount: 300, winnings: 0},
  {name: 'Haunter', tier: 4, team: 'tie', amount: 300, winnings: 0},
  {name: 'Gengar', tier: 5, team: 'red', amount: 300, winnings: 0},
];

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


    set better(person:Better) {
      const {name, tier, team, amount, winnings} = person;

      userService.putDevbits(name, -amount, () => {
        this.bets.push(person);
        bot.whisper(name, `We got your bet of ${amount} on ${team} team. Potential winnings of ${Math.round(winnings)}`);
      });

    }
  }

  var bettingPool = null;
  var betStatus = false;


  function startTimer() {
    let timerInt = setInterval(() => {
      bettingDuration = moment.duration(bettingDuration.asMinutes() - 1, 'minutes');
      console.log("bettingDuration", bettingDuration.asMinutes());

      if (bettingDuration.asMinutes() <= 0 || !betStatus) {
        console.log('clearInterval');
        clearInterval(timerInt);
        betStatus = false;
      }

      else if (bettingDuration.asMinutes() <= 3) {
        if (bettingDuration.asMinutes() === 1) {
          bot.say(`${bettingDuration.asMinutes()} minute left to bet!`);
        }
        bot.say(`${bettingDuration.asMinutes()} minutes left to bet!`);
      }

    }, 60000)
  }

  bot.addCommand('@starttimer', function (o) { //TODO: remove this command.
    betStatus = true;
    startTimer();
  });


  bot.addCommand('@openbets', function (o) {

    if (o.args[0]) { //TODO: remove this later.
      bot.say(`Betting is now open for game #${o.args[0]}`);
      return bettingPool = new Pool(o.args[0], ghostBetters);
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

  bot.addCommand('@betwinner', function(o) {
    const [winningTeam, objectives] = o.args;
    if (~bettingTeams.indexOf(winningTeam) && !isNaN(objectives) && bettingPool != null) {
      console.log('sending bets.');
      for (let i = 0; i < bettingPool.bets.length; i++) {
        var user = bettingPool.bets[i];
        if (user.team === winningTeam && user.tier === objectives) {
          userService.putDevbits(user.name, (user.amount + user.winnings), () => bot.whisperQ(user.name, `You won ${user.amount + user.winnings} devbits!`));
        } else {
          bot.whisperQ(user.name, `You lost ${user.amount} devbits.`);
        }
      }
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
        if (status) return bettingPool.better = {name: from, tier: tier, team: team, amount: amount, winnings: (amount * bettingOdds[bettingTiers.indexOf(tier)])};
        else if (!status) return bot.whisper(from, `You don't have the devbits!`);
      });

    }
  });

  bot.addCommand('*clearbet', function(o) {
    if (!bettingPool) return bot.say('Betting is closed.');
    if (_.findIndex(this.bets, {name: name})) {
      bettingPool.clearBet(o.from);
    }
  })

};
