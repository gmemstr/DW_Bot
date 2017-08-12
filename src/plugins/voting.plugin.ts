import { IPayload, TwitchBot } from '../bot';
import { teamColors, voteCategories, addVoteOnFrame } from '../services/firebase.service';
import * as moment from 'moment';

export enum VotingShorthand { d, f, t }

export class VotingPlugin {
  private isOpen: boolean = false;
  private votingOn: voteCategories = 'design';
  private duration = this.ms(3, 'minutes');
  private voters: [string];

  constructor(private bot: TwitchBot) {
    bot.addCommand('@startvote', async (o:IPayload) => {
      const category = o.args[0];
      if (this.isOpen)
        return bot.whisper(o.user.username, 'voting is open already.');
      switch (category.charAt(0)) {
        case VotingShorthand[VotingShorthand.d]:
          return this.openVotes('design');
        case VotingShorthand[VotingShorthand.f]:
          return this.openVotes('func');
        case VotingShorthand[VotingShorthand.t]:
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
    addVoteOnFrame(team, this.votingOn);
  }

  public openVotes(category: voteCategories) {

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
