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

//TODO: testing only.
const ghostBetters: Array<Better> = [
  {name: 'Gastly', tier: 3, team: 'blue', amount: 300, winnings: 0},
  {name: 'Haunter', tier: 4, team: 'tie', amount: 300, winnings: 0},
  {name: 'Gengar', tier: 5, team: 'red', amount: 300, winnings: 0},
];

export default class Betting {

  constructor(bot) {
    
    // Command to open bets, 
    bot.addCommand('@openbets', async function(o) {
      const gameId = o.args[0] || await gameService.getCurrentGameId();
    });
    
  }

}
