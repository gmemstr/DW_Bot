import { IPayload } from '../interfaces';
import { TwitchBot } from '../bot';
import {
  teamColors,
  voteCategories,
  addVoteOnFrame, resetFrame,
} from '../services/firebase.service';
import * as moment from 'moment';
import { currentGame, sendVotes } from '../services/game.service';

export enum VotingShorthand { d, f, t }

export interface IVoter {
  username: string; team: teamColors;
}

export class VotingPlugin {
  private isOpen: boolean = false;
  private votingOn: voteCategories = 'design';
  private voters: IVoter[] = [];
  private duration = this.ms(3, 'minutes');

  constructor(private bot: TwitchBot) {
    bot.addCommand('@startvote', async (o:IPayload) => {
      const category = o.args[0];
      if (this.isOpen)
        return bot.whisper(o.user.username, 'voting is open already.');
      switch (category.charAt(0)) {
        case VotingShorthand[VotingShorthand.d]:
          bot.say(`Voting opening for design.`);
          return this.openVotes('design');
        case VotingShorthand[VotingShorthand.f]:
          bot.say(`Voting opening for functionality.`);
          return this.openVotes('func');
        case VotingShorthand[VotingShorthand.t]:
          bot.say(`Voting opening for the tiebreaker.`);
          return this.openVotes('tiebreaker');
        default:
          return bot.whisper(o.user.username, 'Could not parse vote category');
      }

    });

    bot.addCommand('*red', async (o:IPayload) => {
      if (!this.isOpen) return bot.say('Voting is closed.');
      if (this.hasVote(o.user.username))
        return bot.whisper(o.user.username, 'You already have a vote placed.');
      this.addVote(o.user.username, 'red');

    });

    bot.addCommand('*blue', async (o:IPayload) => {
      if (!this.isOpen) return bot.say('Voting is closed.');
      if (this.hasVote(o.user.username))
        return bot.whisper(o.user.username, 'You already have a vote placed.');
      this.addVote(o.user.username, 'blue');

    });

  }

  public addVote(username: string, team: teamColors) {
    addVoteOnFrame(team, this.votingOn).then(() => {
      this.voters.push({ username, team });
    });
  }

  public openVotes(category: voteCategories) {
    this.votingOn = category;
    this.isOpen = true;
    return this.timer();
  }

  public timer() {
    const t: any = setInterval(() => {
      this.duration = this.duration - this.ms(1, 'minutes');
      console.log(`this.duration : ${this.duration}`);
      if (this.duration <= 0) {
        this.closeVotes().then(() => {
          this.bot.say('Voting is over.');
          return clearInterval(t);
        });
      }

    }, this.ms(1, 'minutes'));
  }

  public async closeVotes() {
    const game = await currentGame();
    const id = game.id;
    const blueId = game.teams.blue.id;
    const redId = game.teams.red.id;
    if (process.env.NODE_ENV !== 'dev') {
      await Promise.all([
        sendVotes(id, redId, this.votingOn, this.teamVotes('red').length),
        sendVotes(id, blueId, this.votingOn, this.teamVotes('blue').length),
      ]);
    }
    this.votingOn = 'design';
    this.isOpen = false;
    this.duration = this.ms(3, 'minutes');
  }

  public endVotes() {
    // TODO: send data to dw main server.
    this.voters = [];
  }

  /**
   * @method hasVote
   * @description Checks voters array to see if user has already placed a bet.
   * @param {string} username
   * //TODO: I'm splitting this into it's own method to write perf test later.
   */
  private hasVote(username: string): boolean {
    return this.voters.some(obj => obj.username === username);
  }

  private teamVotes(team: teamColors): IVoter[] {
    return this.voters.filter(obj => obj.team === team);
  }

  private ms(duration: number, measurement: 'minutes' | 'seconds' = 'minutes') {
    return moment.duration(duration, measurement).asMilliseconds();
  }

}
