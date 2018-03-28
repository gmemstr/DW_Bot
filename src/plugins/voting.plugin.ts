import { IPayload } from '../interfaces';
import { TwitchBot } from '../twitch.bot';
import {
  teamColors,
  voteCategories,
  addVoteOnFrame, switchVote, switchStage, updateVotingTimestamp,
} from '../services/firebase.service';
import { currentGame } from '../services/game.service';


export interface IVoter {
  username: string; team: teamColors;
}

export class VotingPlugin {
  private isOpen: boolean = false;
  private votingOn: voteCategories = 'ui';
  private voters: IVoter[] = [];
  private duration = TwitchBot.ms(3, 'minutes');

  constructor(private bot: TwitchBot) {
    bot.addCommand('@vote', async (o:IPayload) => {
      const category = o.args[0].toLowerCase();
      if (this.isOpen)
        return bot.whisper(o.user.username, 'voting is open already.');
      switch (category) {
        case 'ui':
          bot.say(`Voting opening for UI. `);
          return this.openVotes('ui');
        case 'ux':
          bot.say(`Voting opening for UX.`);
          return this.openVotes('ux');
        case 'tie':
          bot.say(`Voting opening for the tiebreaker.`);
          return this.openVotes('tiebreaker');
        default:
          return bot.whisper(o.user.username, 'Could not parse vote category');
      }
    });

    bot.addCommand('@review', async (o:IPayload) => {
      const review = o.args[0];
      if (this.isOpen)
        return bot.whisper(o.user.username, 'voting is open');
      switch (review) {
        case 'ui':
          return VotingPlugin.openReview('ui');
        case 'ux':
          return VotingPlugin.openReview('ux');
        default:
          return bot.whisper(o.user.username, 'Could not parse review');
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
    this.voters.push({ username, team });
    addVoteOnFrame(team, this.votingOn);
    return;
  }

  public async openVotes(category: voteCategories) {
    this.votingOn = category;
    await Promise.all([
      switchStage('voting'), switchVote(category), updateVotingTimestamp(),
    ]);
    this.isOpen = true;
    return this.timer();
  }

  public timer() {
    const t: any = setInterval(() => {
      this.duration = this.duration - TwitchBot.ms(1, 'minutes');
      console.log(`this.duration : ${this.duration}`);
      if (this.duration <= 0) {
        this.closeVotes().then(() => {
          this.bot.say('Voting is over.');
          return clearInterval(t);
        });
      }

    }, TwitchBot.ms(1, 'minutes'));
  }

  public async closeVotes(): Promise<void> {
    try {
      const game = await currentGame();
      const id = game.id;
      const blueId = game.teams.blue.id;
      const redId = game.teams.red.id;
      TwitchBot.sysLog('info', 'Voting saved', 'voting', {
        blueId,
        redId,
        voters: this.voters,
        votingOn: this.votingOn,
        gameId: id,
      });
      // await Promise.all([
      //   sendVotes(id, redId, this.votingOn, this.teamVotes('red').length),
      //   sendVotes(id, blueId, this.votingOn, this.teamVotes('blue').length),
      // ]);
      this.votingOn = 'ui';
      this.isOpen = false;
      this.duration = TwitchBot.ms(3, 'minutes');
      this.voters = [];
    } catch (e) {
      TwitchBot.sysLog(
        'error', 'problem closing out votes', 'voting', { error: e });
    }
  }

  public static async openReview(category: voteCategories) {
    await Promise
      .all([switchStage('voting'), switchVote(`review-${category}`)]);
    return;
  }

  /**
   * @method hasVote
   * @description Checks voters array to see if user has already placed a bet.
   * @param {string} username
   */
  private hasVote(username: string): boolean {
    return this.voters.some(obj => obj.username === username);
  }

  private teamVotes(team: teamColors): IVoter[] {
    return this.voters.filter(obj => obj.team === team);
  }

}
