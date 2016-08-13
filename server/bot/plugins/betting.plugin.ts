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

const betTeams = ['red', 'blue'];

enum betVariation {
  type1, type2, type3
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

      bot.addCommand('@openbets', async function(o) {

      if (betting.checkProgress()) return bot.say('Betting already in progress.');

      const gameId = o.args[0] || await gameService.getCurrentGameId();

      bot.say(`Betting is now open for game #${gameId}!`);

      return betting.open(gameId);
    });

    /**
     * Different types of bets:
     * If you are just betting for witch team will win: (type1)
     *    !bet [team] [betAmount]
     *    !bet blue 100
     * If you are betting for a team to get a certain amount of objectives. (type2)
     * Example: !bet 2 red 100 means you are betting for the red team to get more than 2 obj.
     *    !bet [objectives#1-5] [team] [betAmount]
     *    !bet 3 red 100
     * If you are betting that both team will tie: (type3)
     *    !bet tie [betAmount]
     *    !bet tie 100
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

  private getBettingType(arg1, arg2, arg3 = false): any {
    console.log("getBettingTypes:");

    // Determine if Type 1.
    if (betTeams.indexOf(arg1) != -1 && typeof arg2 === 'number') return 'type1';

    // Determine if Type 2.
      else if (arg1 >= 1 && arg1 <=5 && betTeams.indexOf(arg2) != -1 && typeof arg3 === 'number') return 'type2';


    // Determine if Type 3.
      else if (arg1 === 'tie' && typeof arg2 === 'number') return 'type3';

      else return false;




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
