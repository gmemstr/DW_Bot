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

//TODO: testing only.
const ghostBetters: Array<Better> = [
  {name: 'Gastly', tier: 3, team: 'blue', amount: 300, winnings: 0},
  {name: 'Haunter', tier: 4, team: 'tie', amount: 300, winnings: 0},
  {name: 'Gengar', tier: 5, team: 'red', amount: 300, winnings: 0},
];

export default class Betting {

  pool: Pool = {
    open:false,
    openTime: null,
    gameId: null,
    bets: null
  };

  constructor(bot) {

    bot.addCommand('@openbets', async function(o) {
      // Check if betting in already in progress.
      if (this.pool.open) return bot.say('Betting already in progress.');

      const gameId = o.args[0] || await gameService.getCurrentGameId();

      return this.openBetting(gameId);
    });

    bot.addCommand('')

  }

  openBetting(gameId, betters = []) {
    this.pool.openTime = Date.now();
    this.pool.gameId = gameId;
    this.pool.bets = betters;
    this.pool.open = true;
    //TODO: Firebase stuff.
  }

}
