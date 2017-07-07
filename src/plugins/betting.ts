import { IPayload, IUser, TwitchBot } from '../bot';
import * as moment from 'moment';
import * as _ from 'lodash';

export type ObjTypes = false | 0 | 1 | 2 | 3 | 4 | 5 | 'ace';

export interface IBetter {
  name: string;
  tier: number;
  team: 'red' | 'blue' | 'tie';
  amount: number;
  winnings: number;
  mods: {
    objectives: ObjTypes | number;
    strikes: false | string;
  };
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
  one = 1, two, three, four,
}

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
   * @method formatBetter
   * @description This function will make format Better before putting
   *              it is placed into pool.
   * @param {string} name - better username.
   * @param {array} args - arguments from payload.
   *
   */
  private formatBetter(name: string, ...args: any[]): IBetter {
    const [amount, team, ...modifiers] = args;
    // tier starts off at 1 with no modifiers.
    const tier = 1;
    const obj = modifiers[0] || false;
    const strikes = modifiers[1] || false;
    return {
      name,
      team,
      amount,
      tier,
      winnings: 0,
      mods: {
        strikes: this.validStrikes(strikes),
        objectives: this.validObjective(obj),
      },
    };
  }

  private validStrikes(strikes: any): false | string {
    if (
      strikes === 'x' ||
      strikes === 'xx' ||
      strikes === 'xxx'
    ) return strikes;
    return false;
  }

  private validObjective(objective: any): ObjTypes | number {
    if (objective === 'ace') return objective;
    if (objective === false) return false;
    const number = Number(objective);
    if (isNaN(number) || number < 0 || number > 5) {
      return false;
    }
    return number;
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
