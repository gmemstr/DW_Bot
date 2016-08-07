import * as gameService from '../../services/game.service';
import * as userService from '../../services/user.service';
import * as _ from 'lodash';
import * as moment from 'moment';

interface Better {
  name: String;
  tier: Number;
  team: String;
  amount: Number;
  winnings: Number;
}

interface Pool {
  open: Boolean;
  openTime: Number;
  gameId: Number;
  bets: Array<Better>;
}

const minBet = 10;
const maxBet = 10000;

const bettingDuration = moment.duration(10, 'minutes');

enum bettingTiers {
  Tie, One, Two, Three, Four, Ace
}

enum bettingTeams {
  blue, red
}


//TODO: testing only. Remove later
const ghostBetters: Array<Better> = [
  {name: 'Gastly', tier: 3, team: 'blue', amount: 300, winnings: 0},
  {name: 'Haunter', tier: 4, team: 'tie', amount: 300, winnings: 0},
  {name: 'Gengar', tier: 5, team: 'red', amount: 300, winnings: 0},
];

export default class Betting {

  pool: Pool = {
    open: false,
    openTime: null,
    gameId: null,
    bets: null
  };

  constructor(bot) {
    const betting = this;

      bot.addCommand('@openbets', function(o) {

      if (betting.checkProgress()) return bot.say('Betting already in progress.');

      const gameId = o.args[0] || gameService.getCurrentGameId();

      bot.say(`Betting is now open for game #${gameId}!`);

      return betting.open(gameId);
    });

    /**
     * Different types of bets:
     * If you are just betting for witch team will win:
     * //TODO: This type has not been confirmed. No implantation yet.
     *    !bet [team] [betAmount]
     * If you are betting for a team to get a certain amount of objectives:
     *    !bet [objectives#1-5] [team] [betAmount]
     * If you are betting that both team will tie:
     *    !bet tie [betAmount]
     **/
    bot.addCommand('*bet', async function(o) {
      if (!this.pool.open) return bot.say('Betting is currently closed.');

      // Change tie tier into tier Tie so it can be matched against bettingTiers enum.
      if (o.args[0].toLowerCase() === 'tie') o.args[0] = "Tie";

      // Make sure tier argument is valid:
      if (!bettingTiers[o.args[0]]) return bot.say(`${o.from}, invalid betting command.`);

      console.log('bettingTiers[o.args[0]] ', bettingTiers[o.args[0]]);




    })

  }

  private checkProgress() {
    return this.pool.open;
  }

  open(gameId, betters = []) {
    this.pool.openTime = Date.now();
    this.pool.gameId = gameId;
    this.pool.bets = betters;
    this.pool.open = true;
    //TODO: Firebase stuff.
  }

}
