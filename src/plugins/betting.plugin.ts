import { IPayload } from '../interfaces';
import { TwitchBot } from '../bot';
import { hasBits, putBits } from '../services/user.service';
import * as _ from 'lodash';
import {
  addFrameBet, removeFrameBet,
  switchStage, updateBettingTimestamp,
} from '../services/firebase.service';

export type ObjTypes =  0 | 1 | 2 | 3 | 4 | 5;

export interface IBetter {
  name: string;
  team: 'red' | 'blue';
  amount: number;
  winnings: number;
  mods: {
    objectives: ObjTypes | number;
    strikes: false | string;
  };
}

interface IPool {
  open: boolean;
  timer: any;
  duration: number;
  gameId: number;
  bets: IBetter[];
}


export class BettingPlugin {
  public oddValues =
    [(1 / 2), (3 / 5), (4 / 5), (5 / 5), (7 / 5), (10 / 5)];
  private pool: IPool = {
    open: false,
    timer: -1,
    duration: TwitchBot.ms(10),
    gameId: -1,
    bets: [],
  };

  constructor(private bot: TwitchBot) {
    bot.addCommand('*testBet', () => {
      bot.say('test bet command');
    });

    bot.addCommand('*bet', (p:IPayload) => {
      if (!this.pool.open)
        return bot.say('Betting is closed');
      const better = BettingPlugin.formatBetter(p.user.username, p.args);
      if (!better) return bot.whisper(p.user.username, 'Something went wrong' +
        ' when parsing your input.');
      return this.addBet(better);
    });

    bot.addCommand('*clearbet', async (p:IPayload) => {
      if (!this.pool.open)
        return bot.say('Betting is closed');
      if (this.hasBet(p.user.username)) {
        await this.removeBet(p.user.username);
        removeFrameBet(p.user.username);
        console.log(`this.pool.bets`);
        console.log(this.pool.bets);
        return bot.whisper(
          p.user.username,
          'Your previous bet has been returned.',
        );
      } else {
        return bot.whisper(p.user.username, 'You don\'t have a bet in' +
          ' the pool.');
      }

    });

    bot.addCommand('@openBets', async () => {
      if (this.pool.open) return bot.say('Betting pool is currently open.');
      await this.openBets();
      return bot.say('Betting is now open.');
    });

    bot.addCommand('@closeBets', () => {
      if (!this.pool.open) return bot.say('Betting is already closed.');
      this.pool.open = false;
      return bot.say('Betting will be closing soon...');
    });

    bot.addCommand('@winner', (p: IPayload) => {
      const winningTeam = p.args[0].toLowerCase();
      const teamObjectiveCount = p.args[1] || 0;
      try {
        return this.winner(winningTeam, teamObjectiveCount);
      } catch (e) {
        TwitchBot.sysLog
        ('error', 'Problem executing winnings command', 'betting', {
          payload: p,
          data: e,
        });
      }

    });

    bot.addExitFunction(() => {
      if (this.pool.gameId !== -1 && this.pool.bets.length > 1) {
        TwitchBot.sysLog('info', 'saving bets', 'betting', { pool: this.pool });
      }
    });
  }

  public async addBet(better: IBetter) {
    // nah
    let whisper = '';
    // check if user already has bet.
    if (this.hasBet(better.name)) await this.removeBet(better.name)
      .then(() => whisper += 'Your previous bet has been returned & ');

    // check if user has enough bits to bet that amount.
    const hasAmount = await hasBits(better.name, better.amount);
    if (!hasAmount) {
      if (whisper.length > 1) whisper += 'you still don\'t have enough bits. ';
      else whisper += 'You don\'t have enough bits.';
      return this.bot.whisper(better.name, whisper);
    } else {
      await putBits(better.name, BettingPlugin.negative(better.amount))
        .then(() => {
          if (whisper.length > 1) whisper += 'your new ';
          whisper += 'bet has been received. ';
          addFrameBet(better.name, better.amount, better.team);
        });

      this.pool.bets.push(better);
      whisper = whisper.charAt(0).toUpperCase() + whisper.slice(1);
      console.log(`this.pool.bets`);
      console.log(this.pool.bets);
      return this.bot.whisper(better.name, whisper);
    }
  }

  /**
   * @method formatBetter
   * @description This function will make sure amount is valid &
   *              format Better before putting it is placed into pool.
   * @param {string} name - better username.
   * @param {array} args - arguments from payload.
   *
   */
  private static formatBetter(name: string, args: any[]): false | IBetter {
    const [amount, team, ...modifiers] = args;
    if (BettingPlugin.validAmount(amount) === false) return false;
    const obj = modifiers[0] || false;
    const strikes = modifiers[1] || false;
    return {
      name,
      team,
      amount,
      winnings: 0,
      mods: {
        strikes: BettingPlugin.validStrikes(strikes),
        objectives: BettingPlugin.validObjective(obj),
      },
    };
  }

  private static validAmount(amount: any): false | number {
    try {
      // TODO: support #k format.
      const number = Number(amount.toString().replace(/,/g, ''));
      if (isNaN(number)) return false;
      if (number % 1 !== 0) return false;
      if (number <= 0) return false;
      return number;
    } catch (e) { return false; }
  }

  private static validStrikes(strikes: any): false | string {
    if (
      strikes === 'x' ||
      strikes === 'xx' ||
      strikes === 'xxx'
    ) return strikes;
    return false;
  }

  /**
   * @method oddsWinnings
   * @description Winnings based on objective odds.
   * @param {IBetter} better - Better object.
   * @return {number} - amount player should earned if guessed correctly.
   */
  private oddsWinnings(better: IBetter): number {
    const betAmount = better.amount;
    const objPrediction = better.mods.objectives;
    return Math.round(betAmount * this.oddValues[objPrediction]);
  }

  private static validObjective(objective: any): ObjTypes | number {
    if (objective === 'ace') return 5;
    if (objective === false) return 0;
    const number = Number(objective);
    if (isNaN(number) || number < 0 || number > 5) {
      return 0;
    }
    return number;
  }

  /**
   * @method hasBet
   * @description method used for determining of user already has a placed bet.
   * @return {false | number} - returns false if bet was not found,
   *                              returns index number if bet is found.
   */
  private hasBet(name: string): boolean {
    const idx = _.findIndex(this.pool.bets, (b: IBetter) => b.name === name);
    return idx !== -1;
  }

  public async removeBet(name: string) {
    console.log(`removeBet(${name})`);
    removeFrameBet(name);
    await this.returnBetAmount(name);
    return _.remove(this.pool.bets, (b: IBetter) => b.name === name);
  }

  public async openBets() {
    // todo: what happens if this can't find a game?
    // todo: uncomment this later.
    // const game = await currentGame() || { id: 0 };
    this.pool.open = true;
    this.pool.gameId = 0;
    switchStage('betting');
    updateBettingTimestamp();

    this.pool.timer = setInterval(() => {
      this.pool.duration = this.pool.duration - TwitchBot.ms(1);
      if (this.pool.duration < 0 || this.pool.open === false) {
        clearInterval(this.pool.timer);
        return this.closeBets();
      }
    }, TwitchBot.ms(60, 'seconds'));
    return;
  }

  public closeBets() {
    this.pool.open = false;
    this.pool.timer = -1;
    this.pool.duration = TwitchBot.ms(5);
    switchStage('objective');
    return this.bot.say('Betting has been closed.');
  }

  public async winner(team: 'red' | 'blue', objCount: number) {
    _.forEach(this.pool.bets, async (o) => {
      if (o.team !== team) return this.removeBet(o.name);
      // todo: next line doesn't seem to be working?
      if (o.mods.objectives >= objCount) return this.removeBet(o.name);
      const winnings = this.oddsWinnings(o) + o.amount;
      await putBits(o.name, winnings)
        .then(() => {
          this.removeBet(o.name);
          this.bot.whisperQueue(o.name, `You have received ${winnings} bits.`);
        });
      return;
    });
  }

  /**
   * @method returnBetAmount
   * @param {string} name - IUser.name.
   * @return {Promise<void>}
   */
  private async returnBetAmount(name: string) {
    const idx = _.findIndex(this.pool.bets, (b: IBetter) => b.name === name);
    const better = this.pool.bets[idx];
    await putBits(better.name, better.amount);
    return;
  }

  private static negative(num: number) {
    return -Math.abs(num);
  }
}
