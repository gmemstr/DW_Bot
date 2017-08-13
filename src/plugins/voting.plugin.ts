import { IPayload, TwitchBot } from '../bot';
import {
  teamColors,
  voteCategories,
  addVoteOnFrame, resetFrame,
} from '../services/firebase.service';
import * as moment from 'moment';

export enum VotingShorthand { d, f, t }

export class VotingPlugin {
  private isOpen: boolean = false;
  private votingOn: voteCategories = 'design';
  private voters: string[] = [];
  private duration = this.ms(3, 'minutes');
  private timer: any = () => {
    const t: any = setInterval(() => {
      this.duration = this.duration - this.ms(1, 'minutes');
      console.log(`this.duration : ${this.duration}`);
      if (this.duration < 0) {
        this.bot.say('Voting is over.');
        // reset duration.
        this.duration = this.ms(3, 'minutes');
        return clearInterval(t);
      }

    }, this.ms(1, 'minutes'));
  }

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
      this.voters.push(username);
    });
  }

  public openVotes(category: voteCategories) {
    console.log(`category`);
    console.log(category);
    this.timer();
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
    return this.voters.includes(username);
  }

  private ms(duration: number, measurement: 'minutes' | 'seconds' = 'minutes') {
    return moment.duration(duration, measurement).asMilliseconds();
  }

}
