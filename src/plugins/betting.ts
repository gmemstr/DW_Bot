import { IPayload, IUser, TwitchBot } from '../bot';
import * as moment from 'moment';
import * as _ from 'lodash';

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
  bets: IBetter[];
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
  private pool: IPool = {
    open: false,
    openTime: -1,
    gameId: -1,
    bets: [],
  };

  constructor(bot: TwitchBot) {
    bot.addCommand('*testBet', (p: IPayload) => {
      bot.say('test bet command');
    });
  }

  private addBet(name: string, tier: number, amount: number) {

  }

  /**
   * @method hasBet
   * @description method used for determining of user already has a placed bet.
   * @return {false | number} - returns false if bet was not found,
   *                              returns index number if bet is found.
   */
  private hasBet(name: string): false | number {
    const idx = _.findIndex(this.pool.bets, (b: IBetter) => b.name === name);
    return idx !== -1 ? idx : false;
  }

  private async removeBet(name: string): Promise<void> {
    this.pool.bets = _.remove(this.pool.bets, (b: IBetter) => b.name === name);

    return;
  }

  /**
   * @method returnBet
   * @param {number} index - Position
   * @return {Promise<void>}
   */
  private async returnBet(index: number): Promise<void> {

  }
}
