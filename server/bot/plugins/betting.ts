import * as request from 'request';
import config from '../../config/environment';
import {create as createTest} from '../../api/test/test.controller.ts';
import Test from '../../api/test/test.model.ts';
import * as gameService from '../../services/game.service'

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
  constructor(public gameId: Number, public bets: Array<Better>) {}
}


export default function (bot) {
  var bettingPool = false;
  bot.addCommand('*bet', function () {
    bot.say('we got your bet.');
  });

  bot.addCommand('@openbets', function() {
    if (bettingPool !== false) {
      return bot.say('Betting already in progress')
    } else {
      gameService.getCurrentGameId((id) => {
        
      })
    }
  })
}
