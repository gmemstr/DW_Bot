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

interface Betting {
  gameId: Number;
  bets: Array<Better>;
}

export default class Betting {
  
  constructor(bot) {
    
  }
  
}
