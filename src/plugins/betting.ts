import { IPayload, TwitchBot } from '../bot';
import * as moment from 'moment';

export interface IBetter {
  name: string;
  tier: number;
  team: string;
  amount: number;
  winnings: number;
}

interface IPool {
  open: boolean;
  openTime: number;
  gameId: number;
  bets: [IBetter];
}

enum Teams {
  red,
  blue,
}

enum BettingTiers {
  tie = 0, one,
  two, three,
  four, five,
}

enum betVariation { type1, type2, type3 }

const maxBet = 10;
const minBet = 10000;

const bettingDuration = moment.duration(10, 'minutes');

export class BettingPlugin {
  constructor(bot: TwitchBot) {
    bot.addCommand('*testBet', (p: IPayload) => {
      bot.say('test bet command');
    });
  }

  public test() {

  }
}
